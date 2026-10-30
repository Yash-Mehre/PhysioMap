#!/bin/bash

# 
ROOT_DIR="/home/z/my-project/mini-services"

main() {
    echo "🚀 ..."
    
    #  rootdir 
    if [ ! -d "$ROOT_DIR" ]; then
        echo "ℹ️   $ROOT_DIR ，"
        return
    fi
    
    # 
    success_count=0
    fail_count=0
    failed_projects=""
    
    #  mini-services 
    for dir in "$ROOT_DIR"/*; do
        #  package.json
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            project_name=$(basename "$dir")
            echo ""
            echo "📦 : $project_name..."
            
            #  bun install
            if (cd "$dir" && bun install); then
                echo "✅ $project_name "
                success_count=$((success_count + 1))
            else
                echo "❌ $project_name "
                fail_count=$((fail_count + 1))
                if [ -z "$failed_projects" ]; then
                    failed_projects="$project_name"
                else
                    failed_projects="$failed_projects $project_name"
                fi
            fi
        fi
    done
    
    # 
    echo ""
    echo "=================================================="
    if [ $success_count -gt 0 ] || [ $fail_count -gt 0 ]; then
        echo "🎉 ！"
        echo "✅ : $success_count "
        if [ $fail_count -gt 0 ]; then
            echo "❌ : $fail_count "
            echo ""
            echo ":"
            for project in $failed_projects; do
                echo "  - $project"
            done
        fi
    else
        echo "ℹ️   package.json "
    fi
    echo "=================================================="
}

main

