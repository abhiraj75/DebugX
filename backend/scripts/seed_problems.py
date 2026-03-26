"""
Seed script to populate the problems table with simple coding problems.
Run from the backend/ directory:
    python scripts/seed_problems.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.database import SessionLocal, engine, Base
from app.models.models import Problem, DifficultyLevel
import app.models.models

Base.metadata.create_all(bind=engine)


PROBLEMS = [
    {
        "title": "Print 1 to N",
        "slug": "print-1-to-n",
        "description": (
            "Given a number n, print all numbers from 1 to n, each on a new line.\n\n"
            "Input:\n"
            "- A single integer n\n\n"
            "Output:\n"
            "- Numbers from 1 to n, each on a new line"
        ),
        "difficulty": DifficultyLevel.EASY,
        "topic": "Loops",
        "tags": ["loops", "basics"],
        "examples": [
            {"input": "5", "output": "1\n2\n3\n4\n5"},
            {"input": "3", "output": "1\n2\n3"},
        ],
        "constraints": ["1 ≤ n ≤ 100"],
        "starter_code": {
            "python": "n = int(input())\n\n# Print numbers from 1 to n\n"
        },
        "test_cases": [
            {"input": "5", "expected": "1\n2\n3\n4\n5"},
            {"input": "1", "expected": "1"},
            {"input": "3", "expected": "1\n2\n3"},
            {"input": "10", "expected": "1\n2\n3\n4\n5\n6\n7\n8\n9\n10"},
        ],
    },
    {
        "title": "Sum of N Numbers",
        "slug": "sum-of-n-numbers",
        "description": (
            "Given a number n, print the sum of all numbers from 1 to n.\n\n"
            "Input:\n"
            "- A single integer n\n\n"
            "Output:\n"
            "- The sum (a single integer)"
        ),
        "difficulty": DifficultyLevel.EASY,
        "topic": "Loops",
        "tags": ["loops", "math", "basics"],
        "examples": [
            {"input": "5", "output": "15", "explanation": "1+2+3+4+5 = 15"},
            {"input": "10", "output": "55"},
        ],
        "constraints": ["1 ≤ n ≤ 1000"],
        "starter_code": {
            "python": "n = int(input())\n\n# Calculate and print the sum of 1 to n\n"
        },
        "test_cases": [
            {"input": "5", "expected": "15"},
            {"input": "1", "expected": "1"},
            {"input": "10", "expected": "55"},
            {"input": "100", "expected": "5050"},
        ],
    },
    {
        "title": "Even or Odd",
        "slug": "even-or-odd",
        "description": (
            "Given a number, print \"Even\" if it is even, or \"Odd\" if it is odd.\n\n"
            "Input:\n"
            "- A single integer\n\n"
            "Output:\n"
            "- \"Even\" or \"Odd\""
        ),
        "difficulty": DifficultyLevel.EASY,
        "topic": "Conditionals",
        "tags": ["if-else", "basics"],
        "examples": [
            {"input": "4", "output": "Even"},
            {"input": "7", "output": "Odd"},
        ],
        "constraints": ["-1000 ≤ n ≤ 1000"],
        "starter_code": {
            "python": "n = int(input())\n\n# Print \"Even\" or \"Odd\"\n"
        },
        "test_cases": [
            {"input": "4", "expected": "Even"},
            {"input": "7", "expected": "Odd"},
            {"input": "0", "expected": "Even"},
            {"input": "-3", "expected": "Odd"},
            {"input": "100", "expected": "Even"},
        ],
    },
    {
        "title": "Multiplication Table",
        "slug": "multiplication-table",
        "description": (
            "Given a number n, print its multiplication table from 1 to 10.\n"
            "Each line should be in the format: n x i = result\n\n"
            "Input:\n"
            "- A single integer n\n\n"
            "Output:\n"
            "- 10 lines showing the table"
        ),
        "difficulty": DifficultyLevel.EASY,
        "topic": "Loops",
        "tags": ["loops", "basics"],
        "examples": [
            {"input": "5", "output": "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50"},
        ],
        "constraints": ["1 ≤ n ≤ 20"],
        "starter_code": {
            "python": "n = int(input())\n\n# Print multiplication table of n from 1 to 10\n"
        },
        "test_cases": [
            {"input": "5", "expected": "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50"},
            {"input": "2", "expected": "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n2 x 10 = 20"},
            {"input": "1", "expected": "1 x 1 = 1\n1 x 2 = 2\n1 x 3 = 3\n1 x 4 = 4\n1 x 5 = 5\n1 x 6 = 6\n1 x 7 = 7\n1 x 8 = 8\n1 x 9 = 9\n1 x 10 = 10"},
        ],
    },
    {
        "title": "Reverse a String",
        "slug": "reverse-a-string",
        "description": (
            "Given a string, print it reversed.\n\n"
            "Input:\n"
            "- A single line string\n\n"
            "Output:\n"
            "- The reversed string"
        ),
        "difficulty": DifficultyLevel.EASY,
        "topic": "Strings",
        "tags": ["strings", "basics"],
        "examples": [
            {"input": "hello", "output": "olleh"},
            {"input": "abc", "output": "cba"},
        ],
        "constraints": ["1 ≤ length ≤ 100"],
        "starter_code": {
            "python": "s = input()\n\n# Print the reversed string\n"
        },
        "test_cases": [
            {"input": "hello", "expected": "olleh"},
            {"input": "abc", "expected": "cba"},
            {"input": "a", "expected": "a"},
            {"input": "python", "expected": "nohtyp"},
        ],
    },
    {
        "title": "Count Vowels",
        "slug": "count-vowels",
        "description": (
            "Given a string, count how many vowels (a, e, i, o, u) it contains. Count both uppercase and lowercase.\n\n"
            "Input:\n"
            "- A single line string\n\n"
            "Output:\n"
            "- A single integer (the count of vowels)"
        ),
        "difficulty": DifficultyLevel.EASY,
        "topic": "Strings",
        "tags": ["strings", "loops", "basics"],
        "examples": [
            {"input": "hello", "output": "2", "explanation": "e and o are vowels"},
            {"input": "Python", "output": "1", "explanation": "o is the only vowel"},
        ],
        "constraints": ["1 ≤ length ≤ 100"],
        "starter_code": {
            "python": "s = input()\n\n# Count and print the number of vowels\n"
        },
        "test_cases": [
            {"input": "hello", "expected": "2"},
            {"input": "Python", "expected": "1"},
            {"input": "aeiou", "expected": "5"},
            {"input": "xyz", "expected": "0"},
            {"input": "HELLO", "expected": "2"},
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        # Clear existing problems
        existing = db.query(Problem).count()
        if existing > 0:
            print(f"🗑️  Deleting {existing} existing problems...")
            db.query(Problem).delete()
            db.commit()

        for p in PROBLEMS:
            problem = Problem(**p)
            db.add(problem)

        db.commit()
        print(f"✅ Seeded {len(PROBLEMS)} problems successfully!")

        for prob in db.query(Problem).all():
            print(f"   • [{prob.difficulty.value.upper()}] {prob.title} ({prob.slug})")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
