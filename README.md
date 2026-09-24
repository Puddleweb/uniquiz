# UniQuiz

A responsive revision quiz for university modules. Choose a module and week, take a full or quick quiz, read explanations, and retry mistakes.

## Privacy and progress

Each person's answers stay in their browser's local storage. They are not sent to GitHub or shared with other visitors. Progress does not automatically sync across devices. Clearing browser data removes saved progress.

Only website assets and generated practice questions are published. The original lecture slides and local installation paths are excluded. Source titles and slide numbers are provided as references. These are independent revision questions, not official assessments or predictions of exam questions.

## Hosting

Publish the `docs` folder on the `main` branch through GitHub Pages. Future pushes to this folder are automatically deployed by Pages.

## Update questions

Run `python scripts/export_questions.py PATH_TO_LOCAL_QUESTION_BANK` to export the validated desktop question bank. Run `npm test` and review the diff before committing `docs/questions.json`. The export retains only the fields needed for the public quiz.

Question generation runs separately through the owner's local scheduled task. The site itself remains online even when that computer is off.
