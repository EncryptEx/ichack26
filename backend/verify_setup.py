#!/usr/bin/env python3
"""
Setup verification script for Recharge Royale Backend
Run this script to verify your environment is set up correctly.
"""
import os
import sys
import subprocess
from pathlib import Path

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_status(status, message):
    symbol = "✅" if status else "❌"
    print(f"{symbol} {message}")

def main():
    print_header("Recharge Royale Backend - Setup Verification")
    
    all_checks_passed = True
    
    # Check 1: Current directory
    print("\n1. Checking current directory...")
    cwd = Path.cwd()
    print(f"   Current directory: {cwd}")
    
    # Check if we're in backend directory
    app_dir = cwd / "app"
    is_in_backend = app_dir.exists() and app_dir.is_dir()
    
    if is_in_backend:
        print_status(True, "You're in the correct directory (backend)")
    elif cwd.name == "app":
        print_status(False, "You're inside the 'app' directory!")
        print("   ⚠️  You need to go up one level to the 'backend' directory")
        print("   Run: cd ..")
        all_checks_passed = False
    else:
        print_status(False, "Cannot find 'app' directory")
        print("   ⚠️  Navigate to the backend directory first")
        all_checks_passed = False
    
    # Check 2: Python version
    print("\n2. Checking Python version...")
    py_version = sys.version_info
    print(f"   Python version: {py_version.major}.{py_version.minor}.{py_version.micro}")
    if py_version.major == 3 and py_version.minor >= 8:
        print_status(True, "Python version is compatible (3.8+)")
    else:
        print_status(False, f"Python 3.8+ required, found {py_version.major}.{py_version.minor}")
        all_checks_passed = False
    
    # Check 3: Dependencies
    print("\n3. Checking dependencies...")
    required_modules = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "sqlalchemy",
        "passlib",
        "jose"
    ]
    
    missing_modules = []
    for module in required_modules:
        try:
            __import__(module)
            print_status(True, f"{module} is installed")
        except ImportError:
            print_status(False, f"{module} is NOT installed")
            missing_modules.append(module)
            all_checks_passed = False
    
    if missing_modules:
        print("\n   ⚠️  Install missing dependencies:")
        print("   pip install -r app/requirements.txt")
    
    # Check 4: App structure
    print("\n4. Checking application structure...")
    required_files = [
        "app/main.py",
        "app/models.py",
        "app/database.py",
        "app/auth.py",
        "app/requirements.txt"
    ]
    
    for file in required_files:
        file_path = Path(file)
        if file_path.exists():
            print_status(True, f"{file} exists")
        else:
            print_status(False, f"{file} NOT found")
            all_checks_passed = False
    
    # Check 5: Try importing the app
    if is_in_backend:
        print("\n5. Testing application import...")
        try:
            # Add current directory to path temporarily
            sys.path.insert(0, str(cwd))
            from app import main
            print_status(True, "Application imports successfully")
            
            # Check if FastAPI app exists
            if hasattr(main, 'app'):
                print_status(True, "FastAPI app object found")
            else:
                print_status(False, "FastAPI app object not found in main.py")
                all_checks_passed = False
                
        except Exception as e:
            print_status(False, f"Import failed: {str(e)}")
            all_checks_passed = False
    
    # Summary
    print_header("Summary")
    
    if all_checks_passed:
        print("\n🎉 All checks passed! You're ready to run the server.")
        print("\nTo start the server, run:")
        print("   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("\nCommon fixes:")
        print("1. If you're in the wrong directory:")
        print("   cd /path/to/backend")
        print("\n2. If dependencies are missing:")
        print("   pip install -r app/requirements.txt")
        print("\n3. Need help? Check the README.md troubleshooting section")
    
    print("\n" + "="*60)
    return 0 if all_checks_passed else 1

if __name__ == "__main__":
    sys.exit(main())
