# Front-End Engineer Technical Assessment

## Farm Dashboard Application

Welcome to the technical assessment for the Front-End Engineer position. This assessment evaluates your ability to work effectively in an existing codebase while delivering features and making incremental improvements.

---

## Time Limit

**3 hours** (approximately)

- Part 1: Feature Implementation (~1.5 hours)
- Part 2: Code Improvements (~1 hour)
- Part 3: Written Rationale (~30 minutes)

---

## Background

You're joining a team that maintains the **Farm Dashboard** application - an Angular 19 app for managing farm operations. Like many real-world applications, this codebase has accumulated some technical debt over time.

We follow the **"campsite rule"**: leave the code better than you found it. We don't do big-bang refactors. Instead, we make incremental improvements while delivering features.

---

## Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:4200
```

---

## Assessment Tasks

### Part 1: Feature Implementation

**Implement an "Export Dashboard Summary" feature**

The dashboard currently displays farm statistics, animal lists, and health alerts. Users need to export this data for reporting purposes.

**Requirements:**
1. Add an "Export" button to the dashboard (one already exists but is not functional)
2. Export should include:
   - All animals in the current list
   - Current farm statistics
   - Health alerts
3. Export format: CSV
4. The file should download automatically when clicked

**Stretch goals** (if time permits):
- Add option to choose format (CSV vs JSON)
- Add date range filtering to export

### Part 2: Code Improvements ("Campsite Rule")

While working on the export feature, you'll encounter code that could be improved. Your task is to identify and implement improvements that:

1. **Are incremental** - Not big-bang rewrites
2. **Don't break existing functionality** - The app should still work
3. **Improve maintainability** - For a multi-team environment
4. **Are realistic** - Things you'd actually do in a real codebase

**Focus areas to consider:**
- Code duplication
- Service responsibilities
- Component patterns
- Type safety
- State management

**Important:** You don't need to fix everything. Choose the most impactful improvements you can make within the time constraint.

### Part 3: Written Rationale

Complete the `SUBMISSION.md` file explaining:
1. What issues you identified in the codebase
2. Which improvements you chose to implement and why
3. What you would improve next with more time
4. How your changes support multi-team collaboration

---

## Evaluation Criteria

| Criteria | Weight |
|----------|--------|
| Feature Implementation | 40% |
| Code Improvements | 35% |
| Written Rationale | 15% |
| Code Quality | 10% |

### What We're Looking For

**Feature Implementation:**
- Does the export work correctly?
- Does it integrate cleanly with existing code?
- Are edge cases handled?

**Code Improvements:**
- Did you identify meaningful issues (not just cosmetic)?
- Are changes incremental and safe?
- Do improvements benefit team collaboration?

**Written Rationale:**
- Clear explanation of technical decisions
- Understanding of trade-offs
- Realistic prioritization

**Code Quality:**
- Consistent style
- Appropriate typing
- Angular best practices

---

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   └── services/
│   │       └── data.service.ts    # Main data service
│   ├── dashboard/
│   │   ├── dashboard.component.ts  # Main dashboard
│   │   └── ...
│   ├── reports/
│   │   ├── report-daily/           # Daily report
│   │   ├── report-weekly/          # Weekly report
│   │   ├── report-monthly/         # Monthly report
│   │   ├── report-quarterly/       # Quarterly report
│   │   ├── report-yearly/          # Yearly report
│   │   └── report-custom/          # Custom date range
│   └── shared/
└── styles.scss
```

---

## Submission

1. Complete the feature implementation
2. Make your code improvements
3. Fill out `SUBMISSION.md`
4. Ensure the app runs without errors (`npm start`)
5. Submit your work as instructed

---

## Tips

- **Read the existing code** before making changes
- **Keep changes focused** - Don't try to fix everything
- **Test your changes** - Make sure the app still works
- **Explain your decisions** - The rationale matters as much as the code
- **Time management** - Don't spend all your time on one part

---

## Bonus: Unit Tests (Optional)

While not required, we highly appreciate submissions that include unit tests. If you have time after completing the main tasks, consider adding tests for:

- Your export functionality
- Any services or utilities you create or refactor
- Edge cases in your implementation

Well-written tests demonstrate:
- Your understanding of testable code design
- How you think about edge cases
- Your familiarity with Angular testing patterns

**Note:** This is entirely optional. A submission without tests will not be penalized. However, quality tests can positively influence your evaluation.

---

## Questions?

If you have questions about the requirements, make reasonable assumptions and document them in your submission.

Good luck!
