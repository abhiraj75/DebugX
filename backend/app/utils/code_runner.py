"""
Sandboxed code execution utility.
Runs user code against test cases in a subprocess with timeout.
"""

import subprocess
import sys
import json
import tempfile
import os
import time
from typing import List, Optional
from app.utils.config import settings


def run_code_against_tests(
    user_code: str,
    test_cases: List[dict],
    language: str = "python",
    timeout: Optional[int] = None,
) -> dict:
    """
    Execute user code against a list of test cases.

    Each test_case should have:
        - "input": string to pass as stdin
        - "expected": expected stdout output (stripped)

    Returns:
        {
            "status": "accepted" | "wrong_answer" | "runtime_error" | "compile_error" | "time_limit_exceeded",
            "test_results": [ {test_number, input, expected, actual, passed, error} ],
            "passed_tests": int,
            "total_tests": int,
            "score": int (0-100),
            "execution_time_ms": int,
            "error_message": str | None,
        }
    """
    if language != "python":
        return {
            "status": "compile_error",
            "test_results": [],
            "passed_tests": 0,
            "total_tests": len(test_cases),
            "score": 0,
            "execution_time_ms": 0,
            "error_message": f"Language '{language}' is not supported yet. Only Python is available.",
        }

    if timeout is None:
        timeout = settings.MAX_EXECUTION_TIME

    test_results = []
    passed = 0
    total = len(test_cases)
    total_time_ms = 0
    overall_error = None

    for i, tc in enumerate(test_cases, start=1):
        tc_input = tc.get("input", "")
        tc_expected = tc.get("expected", "").strip()

        result = _execute_python(user_code, tc_input, timeout)

        actual = result["stdout"].strip() if result["stdout"] else ""
        is_passed = actual == tc_expected and result["error"] is None

        if is_passed:
            passed += 1

        if result["error"] and overall_error is None:
            overall_error = result["error"]

        total_time_ms += result["time_ms"]

        test_results.append({
            "test_number": i,
            "input": tc_input,
            "expected": tc_expected,
            "actual": actual,
            "passed": is_passed,
            "error": result["error"],
        })

    # Determine overall status
    if overall_error and "SyntaxError" in overall_error:
        status = "compile_error"
    elif overall_error and "TimeoutExpired" in str(overall_error):
        status = "time_limit_exceeded"
    elif overall_error and passed == 0:
        status = "runtime_error"
    elif passed == total:
        status = "accepted"
    else:
        status = "wrong_answer"

    score = int((passed / total) * 100) if total > 0 else 0

    return {
        "status": status,
        "test_results": test_results,
        "passed_tests": passed,
        "total_tests": total,
        "score": score,
        "execution_time_ms": total_time_ms,
        "error_message": overall_error,
    }


def _execute_python(code: str, stdin_input: str, timeout: int) -> dict:
    """Run a Python code snippet in a subprocess and return stdout/stderr/time."""
    tmp_file = None
    try:
        # Write user code to a temp file
        tmp_file = tempfile.NamedTemporaryFile(
            mode="w", suffix=".py", delete=False, dir="/tmp"
        )
        tmp_file.write(code)
        tmp_file.close()

        start = time.time()
        result = subprocess.run(
            [sys.executable, tmp_file.name],
            input=stdin_input,
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        elapsed_ms = int((time.time() - start) * 1000)

        error = None
        if result.returncode != 0:
            error = result.stderr.strip() if result.stderr else f"Exit code {result.returncode}"

        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "error": error,
            "time_ms": elapsed_ms,
        }

    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": "",
            "error": f"TimeoutExpired: Code took longer than {timeout} seconds",
            "time_ms": timeout * 1000,
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": "",
            "error": str(e),
            "time_ms": 0,
        }
    finally:
        if tmp_file and os.path.exists(tmp_file.name):
            os.unlink(tmp_file.name)
