"""
Gemini AI integration for generating code hints.
Uses the google-generativeai SDK to call Gemini and return
helpful, SPECIFIC hints that directly point out the bug.
"""

import json
import google.generativeai as genai
from app.utils.config import settings
from app.utils.logger import get_logger
from typing import List, Optional

logger = get_logger(__name__)

# Configure the SDK
genai.configure(api_key=settings.GEMINI_API_KEY)

# Use Gemini 2.5 Flash as it is supported in the current API key quota
model = genai.GenerativeModel("gemini-2.5-flash")
logger.info("Gemini AI model initialized (model=gemini-2.5-flash)")


SYSTEM_PROMPT = """You are a Python tutor. A beginner student's code failed some test cases. You can see their code, the input, what their code printed, and what the correct output should be.

YOUR JOB: Find the EXACT bug in their code and tell them directly what's wrong.

RULES:
1. PINPOINT the exact line and expression causing the bug. For example:
   - "Your `range(1, n)` on line 3 stops at n-1, so it misses the last number. range() in Python excludes the end value."
   - "On line 4, you're printing `i * 2` but the problem asks for `i * n`."
   - "You forgot to convert the input to lowercase before checking vowels, so uppercase vowels are missed."
2. If it's an off-by-one error, SAY SO clearly (e.g. "range(1, n) gives 1 to n-1, you need range(1, n+1) to include n")
3. If the student's code is completely empty or just the starter code, tell them what to write first (e.g. "You need to add a for loop")
4. Be direct and clear. No fluff. Speak like a helpful friend, not a textbook.
5. Do NOT just give them the corrected code — explain the WHY so they learn.

FORMAT — return ONLY this JSON:
{
  "feedback_text": "Direct explanation of the bug, referencing the specific line and expression (2-4 sentences).",
  "suggestions": ["do this specific thing", "then check this"]
}"""


def get_hint(
    problem_title: str,
    problem_description: str,
    user_code: str,
    passed_tests: int,
    total_tests: int,
    failed_test_details: Optional[List[dict]] = None,
    error_message: Optional[str] = None,
) -> dict:
    """
    Call Gemini to generate a specific hint.

    failed_test_details: list of {"input": ..., "expected": ..., "actual": ...}
    """
    logger.info(
        "Generating AI hint for problem '%s' (passed=%d/%d)",
        problem_title, passed_tests, total_tests,
    )

    # Number the lines so the AI can reference them
    numbered_code = "\n".join(
        f"{i+1}: {line}" for i, line in enumerate(user_code.splitlines())
    )

    # Build the prompt with full debug info
    parts = [
        f"Problem: {problem_title}",
        f"Description:\n{problem_description}",
        f"\nStudent's code:\n```\n{numbered_code}\n```",
        f"\nResult: {passed_tests}/{total_tests} tests passed.",
    ]

    if error_message:
        parts.append(f"\nError: {error_message}")

    if failed_test_details:
        parts.append("\nFailing test cases:")
        for i, td in enumerate(failed_test_details[:3]):
            parts.append(f"  Test {i+1}:")
            parts.append(f"    Input: {td['input']}")
            parts.append(f"    Expected output: {td['expected']}")
            parts.append(f"    Student's output: {td['actual']}")

    user_prompt = "\n".join(parts)

    try:
        response = _call_gemini(user_prompt)
        text = response.text.strip()

        result = json.loads(text)
        logger.info("AI hint generated successfully for problem '%s'", problem_title)
        return {
            "feedback_text": result.get("feedback_text", "Check your code logic carefully."),
            "suggestions": result.get("suggestions", []),
        }

    except Exception as e:
        logger.error("Gemini API error for problem '%s': %s", problem_title, str(e))
        return {
            "feedback_text": "AI hints are temporarily unavailable (API rate limit reached). Try again in a minute!",
            "suggestions": [
                "Compare your output with the examples in the problem",
                "Check if your range() includes the right start and end values",
                "Try running your code manually with the example input",
            ],
        }


def _call_gemini(user_prompt: str, retries: int = 2):
    """Call Gemini with automatic retry on rate limit errors."""
    import time
    for attempt in range(retries + 1):
        try:
            logger.debug("Gemini API call attempt %d/%d", attempt + 1, retries + 1)
            return model.generate_content(
                [
                    {"role": "user", "parts": [SYSTEM_PROMPT + "\n\n" + user_prompt]},
                ],
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    response_mime_type="application/json",
                ),
            )
        except Exception as e:
            if "429" in str(e) and attempt < retries:
                logger.warning("Gemini rate limited, retrying in 18s (attempt %d/%d)", attempt + 1, retries)
                time.sleep(18)
            else:
                raise
