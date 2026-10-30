/**
 * Health Summary PDF — client-only renderer behind the Summary tab.
 *
 * The UI assembles a plain, fully pre-formatted snapshot
 * (`HealthSummarySnapshot`) and this module lays it out as a branded A4
 * document with jspdf + jspdf-autotable. It knows nothing about React or the
 * stores on purpose: dumb renderer, serializable data.
 */

import { format } from 'date-fns'
import type { jsPDF } from 'jspdf'
import type { UserOptions } from 'jspdf-autotable'
import { toDateKey } from '@/lib/health/hydration'
import { SITE } from '@/config/site'

// ---------------------------------------------------------------------------
// Snapshot contract (plain serializable data — assembled by SummaryTab)
// ---------------------------------------------------------------------------

export interface HealthSummaryProfileBlock {
  ageLabel: string
  sexLabel: string
  heightLabel: string
  weightLabel: string
  activityLabel: string
  goalLabel: string
  paceLabel: string
  dietLabel: string
  exclusionsLabel: string
  /** Joined medical-history labels, or "None reported". */
  medicalHistoryLabel: string
}

export interface HealthSummaryBmiBlock {
  valueLabel: string
  categoryLabel: string
  healthyRangeLabel: string
}

export interface HealthSummaryEnergyBlock {
  bmrLabel: string
  tdeeLabel: string
  targetLabel: string
  deltaLabel: string
  floorApplied: boolean
}

export interface HealthSummaryMacroRow {
  name: string
  gramsLabel: string
  kcalLabel: string
  shareLabel: string
}

export interface HealthSummaryMacrosBlock {
  rows: HealthSummaryMacroRow[]
  fiberLabel: string
}

export interface HealthSummaryWaterDay {
  label: string
  amountMl: number
  goalMl: number
}

export interface HealthSummaryWaterBlock {
  goalLabel: string
  todayLabel: string
  week: HealthSummaryWaterDay[]
}

export interface HealthSummaryMeal {
  label: string
  itemsLabel: string
  kcal: number
  protein: number
}

export interface HealthSummaryMealPlanBlock {
  mealsPerDayLabel: string
  meals: HealthSummaryMeal[]
  totalsLabel: string
}

export interface HealthSummaryWorkoutItem {
  name: string
  setsReps: string
  done: boolean
}

export interface HealthSummaryPainEntry {
  regionLabel: string
  severityLabel: string
  dateLabel: string
}

export interface HealthSummarySnapshot {
  /** ISO timestamp of the moment the user pressed download. */
  generatedAt: string
  profile: HealthSummaryProfileBlock | null
  bmi: HealthSummaryBmiBlock | null
  energy: HealthSummaryEnergyBlock | null
  macros: HealthSummaryMacrosBlock | null
  water: HealthSummaryWaterBlock | null
  mealPlan: HealthSummaryMealPlanBlock | null
  workout: HealthSummaryWorkoutItem[] | null
  painLog: HealthSummaryPainEntry[] | null
}

// ---------------------------------------------------------------------------
// Palette & geometry (mm, A4 portrait)
// ---------------------------------------------------------------------------

const COLOR_NAVY: [number, number, number] = [11, 15, 23] // #0B0F17
const COLOR_BLUE: [number, number, number] = [47, 99, 224] // #2F63E0
const COLOR_COPPER: [number, number, number] = [217, 160, 102] // #D9A066
const COLOR_TEXT: [number, number, number] = [30, 41, 59] // slate-800
const COLOR_MUTED: [number, number, number] = [100, 116, 139] // slate-500
const COLOR_LINE: [number, number, number] = [226, 232, 240] // slate-200
const COLOR_STRIPE: [number, number, number] = [248, 250, 252] // slate-50
const COLOR_TOTALS_FILL: [number, number, number] = [233, 240, 253] // light blue
const COLOR_WHITE: [number, number, number] = [255, 255, 255]

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const MARGIN_X = 14
const FIRST_HEADER_HEIGHT = 28
const SLIM_HEADER_HEIGHT = 12
/** Content must not draw below this line (footer band starts at 283 mm). */
const CONTENT_BOTTOM = 275
const FOOTER_LINE_Y = 283
const FOOTER_TEXT_Y = 287

const FOOTER_DISCLAIMER = 'Educational guidance, not medical advice.'

// ---------------------------------------------------------------------------
// Runtime access to the `lastAutoTable` stamp (untyped in jspdf-autotable v5)
// ---------------------------------------------------------------------------

function getLastAutoTableFinalY(doc: jsPDF): number | undefined {
  const extension = (doc as unknown as { lastAutoTable?: { finalY?: unknown } }).lastAutoTable
  return typeof extension?.finalY === 'number' ? extension.finalY : undefined
}

// ---------------------------------------------------------------------------
// Header / footer chrome
// ---------------------------------------------------------------------------

function formatGeneratedDate(iso: string): string {
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? format(new Date(), 'd MMMM yyyy') : format(parsed, 'd MMMM yyyy')
}

/** Brand header on page 1: dark navy band, wordmark, tagline, copper bar, date. */
function drawCoverHeader(doc: jsPDF, generatedAt: string): void {
  doc.setFillColor(...COLOR_NAVY)
  doc.rect(0, 0, PAGE_WIDTH, FIRST_HEADER_HEIGHT, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...COLOR_WHITE)
  doc.text(SITE.name, MARGIN_X, 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(154, 166, 188)
  doc.text(SITE.tagline, MARGIN_X, 19.5)

  doc.setFillColor(...COLOR_COPPER)
  doc.rect(MARGIN_X, 22.5, 26, 1.5, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_WHITE)
  doc.text(formatGeneratedDate(generatedAt), PAGE_WIDTH - MARGIN_X, 13, { align: 'right' })
}

/** Slim repeat header for continuation pages. */
function drawSlimHeader(doc: jsPDF): void {
  doc.setFillColor(...COLOR_NAVY)
  doc.rect(0, 0, PAGE_WIDTH, SLIM_HEADER_HEIGHT, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...COLOR_WHITE)
  doc.text(`${SITE.name} — Health Summary`, MARGIN_X, 7.5)
}

/** Footer on every page: rule, credits left, disclaimer center, page count right. */
function drawFooters(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...COLOR_LINE)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_X, FOOTER_LINE_Y, PAGE_WIDTH - MARGIN_X, FOOTER_LINE_Y)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)
    const credits = `${SITE.name} by ${SITE.team} · ${SITE.event}`
    const pageCountLabel = `Page ${page} of ${pageCount}`
    doc.text(credits, MARGIN_X, FOOTER_TEXT_Y)
    doc.text(pageCountLabel, PAGE_WIDTH - MARGIN_X, FOOTER_TEXT_Y, { align: 'right' })

    doc.setFont('helvetica', 'italic')
    const creditsEnd = MARGIN_X + doc.getTextWidth(credits)
    const countStart = PAGE_WIDTH - MARGIN_X - doc.getTextWidth(pageCountLabel)
    const disclaimerX = (creditsEnd + countStart) / 2
    doc.text(FOOTER_DISCLAIMER, disclaimerX, FOOTER_TEXT_Y, { align: 'center' })
  }
}

// ---------------------------------------------------------------------------
// Main renderer
// ---------------------------------------------------------------------------

export async function generateHealthSummaryPdf(snapshot: HealthSummarySnapshot): Promise<void> {
  const { default: JsPdfConstructor } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default

  const doc = new JsPdfConstructor({ orientation: 'p', unit: 'mm', format: 'a4' })
  drawCoverHeader(doc, snapshot.generatedAt)

  const cursor = { y: FIRST_HEADER_HEIGHT + 8 }

  const ensureSpace = (needed: number): void => {
    if (cursor.y + needed <= CONTENT_BOTTOM) return
    doc.addPage()
    drawSlimHeader(doc)
    cursor.y = SLIM_HEADER_HEIGHT + 8
  }

  const drawSectionHeading = (title: string, note?: string): void => {
    ensureSpace(20)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...COLOR_BLUE)
    doc.text(title.toUpperCase(), MARGIN_X, cursor.y + 3)
    if (note) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8)
      doc.setTextColor(...COLOR_MUTED)
      doc.text(note, PAGE_WIDTH - MARGIN_X, cursor.y + 3, { align: 'right' })
    }
    doc.setDrawColor(...COLOR_LINE)
    doc.setLineWidth(0.3)
    doc.line(MARGIN_X, cursor.y + 5.5, PAGE_WIDTH - MARGIN_X, cursor.y + 5.5)
    cursor.y += 11
  }

  const drawNotProvided = (): void => {
    ensureSpace(8)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_MUTED)
    doc.text('Not provided', MARGIN_X, cursor.y + 3)
    cursor.y += 8
  }

  /** "Label value" pair — value auto-placed right after the measured label. */
  const drawLabelValue = (label: string, value: string, x: number, y: number): void => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(label, x, y)
    const labelWidth = doc.getTextWidth(label)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLOR_TEXT)
    doc.text(value, x + labelWidth + 3.5, y)
  }

  /** "Label value" pair where the value wraps onto further lines when long. */
  const drawWrappedLabelValue = (label: string, value: string, x: number): number => {
    let y = cursor.y + 3
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(label, x, y)
    const labelWidth = doc.getTextWidth(label)
    const maxWidth = PAGE_WIDTH - MARGIN_X - (x + labelWidth + 3.5)
    const lines = doc.splitTextToSize(value, maxWidth) as string[]
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLOR_TEXT)
    lines.forEach((line, index) => {
      if (index > 0) {
        ensureSpace(6)
        y = cursor.y + 3
      }
      doc.text(line, x + labelWidth + 3.5, y)
      if (index < lines.length - 1) cursor.y += 5.5
    })
    return lines.length
  }

  const tableDefaults: UserOptions = {
    theme: 'grid',
    margin: { left: MARGIN_X, right: MARGIN_X, top: SLIM_HEADER_HEIGHT + 6, bottom: PAGE_HEIGHT - CONTENT_BOTTOM },
    styles: { fontSize: 9, textColor: COLOR_TEXT, lineColor: COLOR_LINE, lineWidth: 0.2, cellPadding: 2 },
    headStyles: { fillColor: COLOR_BLUE, textColor: COLOR_WHITE, fontStyle: 'bold', cellPadding: 2.2 },
    footStyles: { fillColor: COLOR_TOTALS_FILL, textColor: COLOR_TEXT, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: COLOR_STRIPE },
  }

  const drawTable = (options: UserOptions): void => {
    ensureSpace(22)
    const startY = cursor.y
    autoTable(doc, {
      ...tableDefaults,
      ...options,
      startY,
      didDrawPage: (data) => {
        if (data.pageNumber > 1) drawSlimHeader(doc)
        options.didDrawPage?.(data)
      },
    })
    const finalY = getLastAutoTableFinalY(doc)
    cursor.y = Math.max(cursor.y, finalY ?? startY) + 7
  }

  // -- Profile snapshot ------------------------------------------------------

  if (snapshot.profile) {
    drawSectionHeading('Profile snapshot')
    const profile = snapshot.profile
    const columnX: [number, number] = [MARGIN_X, MARGIN_X + 92]
    const rows: Array<[string, string, string, string]> = [
      ['Age', profile.ageLabel, 'Sex', profile.sexLabel],
      ['Height', profile.heightLabel, 'Weight', profile.weightLabel],
      ['Activity', profile.activityLabel, 'Goal', profile.goalLabel],
      ['Pace', profile.paceLabel, 'Diet', profile.dietLabel],
    ]
    rows.forEach((row) => {
      ensureSpace(9)
      drawLabelValue(row[0], row[1], columnX[0], cursor.y + 3)
      drawLabelValue(row[2], row[3], columnX[1], cursor.y + 3)
      cursor.y += 6.5
    })
    ensureSpace(9)
    drawLabelValue('Exclusions', profile.exclusionsLabel, MARGIN_X, cursor.y + 3)
    cursor.y += 8
    ensureSpace(9)
    drawWrappedLabelValue('Medical history', profile.medicalHistoryLabel, MARGIN_X)
    cursor.y += 10
  }

  // -- BMI -------------------------------------------------------------------

  if (snapshot.bmi) {
    drawSectionHeading('Body mass index')
    ensureSpace(22)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...COLOR_TEXT)
    doc.text(snapshot.bmi.valueLabel, MARGIN_X, cursor.y + 4)
    const valueWidth = doc.getTextWidth(snapshot.bmi.valueLabel)
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_BLUE)
    doc.text(snapshot.bmi.categoryLabel, MARGIN_X + valueWidth + 4, cursor.y + 4)
    cursor.y += 10
    drawLabelValue('Healthy weight range', snapshot.bmi.healthyRangeLabel, MARGIN_X, cursor.y + 3)
    cursor.y += 11
  }

  // -- Energy & macros ---------------------------------------------------------

  if (snapshot.energy !== null || snapshot.macros !== null) {
    drawSectionHeading('Energy & macros')
    if (snapshot.energy) {
      const energy = snapshot.energy
      ensureSpace(16)
      drawLabelValue('BMR', energy.bmrLabel, MARGIN_X, cursor.y + 3)
      drawLabelValue('TDEE', energy.tdeeLabel, MARGIN_X + 92, cursor.y + 3)
      cursor.y += 6.5
      ensureSpace(9)
      drawLabelValue('Daily target', energy.targetLabel, MARGIN_X, cursor.y + 3)
      drawLabelValue('Daily delta', energy.deltaLabel, MARGIN_X + 92, cursor.y + 3)
      cursor.y += 6.5
      if (energy.floorApplied) {
        ensureSpace(7)
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(8.5)
        doc.setTextColor(...COLOR_MUTED)
        doc.text('Safety floor applied — the computed target sat below the minimum safe intake.', MARGIN_X, cursor.y + 3)
        cursor.y += 7
      }
    } else {
      drawNotProvided()
    }

    if (snapshot.macros) {
      if (snapshot.macros.rows.length === 0) {
        drawNotProvided()
      } else {
        drawTable({
          head: [['Macro', 'Grams / day', 'kcal', '% of calories']],
          body: snapshot.macros.rows.map((row) => [row.name, row.gramsLabel, row.kcalLabel, row.shareLabel]),
          columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
        })
        ensureSpace(8)
        drawLabelValue('Fiber target', snapshot.macros.fiberLabel, MARGIN_X, cursor.y + 3)
        cursor.y += 11
      }
    }
  }

  // -- Water -------------------------------------------------------------------

  if (snapshot.water) {
    drawSectionHeading('Water')
    ensureSpace(14)
    drawLabelValue('Daily goal', snapshot.water.goalLabel, MARGIN_X, cursor.y + 3)
    drawLabelValue("Today's intake", snapshot.water.todayLabel, MARGIN_X + 92, cursor.y + 3)
    cursor.y += 7

    const week = snapshot.water.week
    if (week.length === 0) {
      drawNotProvided()
    } else {
      const chartHeight = 24
      ensureSpace(chartHeight + 12)
      const chartWidth = PAGE_WIDTH - MARGIN_X * 2
      const chartTop = cursor.y + 5
      const baseline = chartTop + chartHeight
      const goalMl = Math.max(...week.map((day) => day.goalMl), 1)
      const maxAmount = Math.max(...week.map((day) => day.amountMl), 0)
      const scaleMax = Math.max(goalMl, maxAmount, 1)
      const barWidth = 14
      const gap = (chartWidth - week.length * barWidth) / Math.max(week.length - 1, 1)

      // Baseline
      doc.setDrawColor(...COLOR_LINE)
      doc.setLineWidth(0.3)
      doc.line(MARGIN_X, baseline, MARGIN_X + chartWidth, baseline)

      // Bars + labels
      week.forEach((day, index) => {
        const x = MARGIN_X + index * (barWidth + gap)
        const ratio = Math.min(Math.max(day.amountMl / scaleMax, 0), 1)
        const barHeight = day.amountMl > 0 ? Math.max(ratio * chartHeight, 0.8) : 0
        if (barHeight > 0) {
          doc.setFillColor(...COLOR_BLUE)
          doc.rect(x, baseline - barHeight, barWidth, barHeight, 'F')
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(7)
          doc.setTextColor(...COLOR_TEXT)
          doc.text(formatBarAmount(day.amountMl), x + barWidth / 2, baseline - barHeight - 1.6, { align: 'center' })
        }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...COLOR_MUTED)
        doc.text(day.label, x + barWidth / 2, baseline + 3.4, { align: 'center' })
      })

      // Goal line
      const goalY = baseline - (goalMl / scaleMax) * chartHeight
      doc.setDrawColor(...COLOR_COPPER)
      doc.setLineWidth(0.4)
      doc.setLineDashPattern([2, 1.5], 0)
      doc.line(MARGIN_X, goalY, MARGIN_X + chartWidth, goalY)
      doc.setLineDashPattern([], 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...COLOR_COPPER)
      doc.text('Goal', MARGIN_X + chartWidth, goalY - 1.4, { align: 'right' })

      cursor.y = baseline + 8
    }
  }

  // -- Today's meal plan -------------------------------------------------------

  if (snapshot.mealPlan) {
    drawSectionHeading("Today's meal plan")
    if (snapshot.mealPlan.meals.length === 0) {
      drawNotProvided()
    } else {
      const plan = snapshot.mealPlan
      ensureSpace(8)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...COLOR_MUTED)
      doc.text(`${plan.mealsPerDayLabel} · ${plan.totalsLabel}`, MARGIN_X, cursor.y + 3)
      cursor.y += 6
      const totalKcal = plan.meals.reduce((sum, meal) => sum + meal.kcal, 0)
      const totalProtein = plan.meals.reduce((sum, meal) => sum + meal.protein, 0)
      drawTable({
        head: [['Meal', 'Items', 'kcal', 'Protein (g)']],
        body: plan.meals.map((meal) => [
          meal.label,
          meal.itemsLabel,
          meal.kcal.toLocaleString(),
          `${meal.protein}`,
        ]),
        foot: [['Daily total', '', totalKcal.toLocaleString(), `${totalProtein}`]],
        columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
      })
    }
  }

  // -- My workout --------------------------------------------------------------

  if (snapshot.workout) {
    drawSectionHeading('My workout')
    if (snapshot.workout.length === 0) {
      drawNotProvided()
    } else {
      drawTable({
        head: [['Exercise', 'Sets × Reps', 'Status']],
        body: snapshot.workout.map((item) => [item.name, item.setsReps, item.done ? 'Done' : 'Not done']),
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
      })
    }
  }

  // -- Recent pain log -----------------------------------------------------------

  if (snapshot.painLog) {
    drawSectionHeading('Recent pain log', 'Self-reported')
    if (snapshot.painLog.length === 0) {
      drawNotProvided()
    } else {
      drawTable({
        head: [['Region', 'Severity', 'Date']],
        body: snapshot.painLog.map((entry) => [entry.regionLabel, entry.severityLabel, entry.dateLabel]),
        columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
      })
    }
  }

  drawFooters(doc)
  doc.save(`PhysioMap-Health-Summary-${toDateKey(new Date())}.pdf`)
}

/** Compact chart label: "2.5 L" / "250 ml". */
function formatBarAmount(ml: number): string {
  if (ml >= 1000) {
    const liters = ml / 1000
    return `${liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1)} L`
  }
  return `${Math.round(ml)} ml`
}
