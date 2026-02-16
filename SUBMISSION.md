# Assessment Submission

**Candidate Name:** [Shayan Abdullah]
**Date:** [Date]
**Time Spent:** [~2hrs]

---

## Part 1: Feature Implementation

### Export Feature Summary

_Briefly describe your export feature implementation:_

- crteated a function to export csv which handles the blob, and download link
- To keep it clean, wrote all the csv logic in createCsc function. This function check is only responsible to create csv
- To sanitise all inputs, I used a helper function - sanitise().

### Technical Approach

_Explain how you implemented the export functionality:_

- Based on the requirements, the function createCsv is divided in three parts.
- The first one is current farm statistics which checks for the stats variable, leaves a message is there's none (in case of API error), and then loops through the required values and push those in the data array.
- The second one is to display all health alerts, hence looped through the (already exisiting) alerts variable to push those into the data array.
- Lastly, run through the list of already existing animals array to print out list of animals. 
- At each step, I have handled case where data isnt available. The repost still prints successfully.

### Edge Cases Handled

_List any edge cases you considered:_

- Considered edge cases like null and undefined data. 
- Sanitsed all values to ensure correct response
- Used types to ensure safety

---

## Part 2: Code Improvements

### Issues Identified

_List the code issues you identified in the codebase (you don't need to fix all of them):_

| Issue |    Location  | Severity | Description |
|-------|--------------|----------|-------------|
| | | | | data service | High     | getMockAnimals should be called from an external object as its not a good practise to have data stored alongwith the logic. Better approach should be to create a separate json and fetch the response. This would be better even in case of backend implementation.
| | | | | /reports      | High      | Reports can all be merged into one single component with pills or tags for quick setting like Daily, Monthly, Weekly etc. There's no need to create separate components with minor differences. 
| | | | | /reports      | Medium    | exportReport() in all the reports components can be a shared service with the dashboard with minor changes. This can be an export service.
| | | | | 
| | | | |

### Improvements Implemented

_Describe the improvements you chose to implement and why:_

#### Improvement 1: [Improved types]

**What:** Reviewed types in dashboard component and added new types where there werent any.

**Why:** This helps prevent errors in processing and data handling

**Impact:** Each function expects a certain type of input and output. Makes the response more structured.

---

#### Improvement 2: [unsubscribe missing services]

**What:** widgetSubscription & statsSubscription were not unsubscribed from in the ngDestroy() & separated the nested call.

**Why:** Nested subscription puts massive load on the process. There's no need to do that. Also, the subscriptions werent unsubscribed from causing memory leaks, and impacting performance.

**Impact:** memory leaks, and impacting performance.

---

#### Improvement 3: [Title] (if applicable)

**What:**

**Why:**

**Impact:**

---

### Why These Improvements?

_Explain why you prioritized these improvements over others:_

- I was already working in the dasboard component so I improved the code without making massive changes in all the files.
- These changes have bigger impact and they moved the code in the right direction.

---

## Part 3: Future Improvements

### What I Would Do Next

_If you had more time, what would you improve? Prioritize by impact:_

1. **[High Priority]:** Create a centralised export function.

2. **[Medium Priority]:** Write univsersal reports function which handles all current requirements

3. **[Lower Priority]:** Have a separate interface or types file

---

## Multi-Team Collaboration

### How My Changes Support Teams

_Explain how your improvements help multiple teams work in the codebase:_

Right now, they can use the export functionality. It wasnt there earlier. Also, they can use the exported interfaces from the data.service. They will also see improvement in perfromance from spliting the subscription calls.

### Reducing Merge Conflicts

_How do your changes reduce the likelihood of teams stepping on each other?_

As you can see I have made changes to two files only. This practise ensures that there are least code conflicts.

---

## Assumptions Made

_List any assumptions you made during the assessment:_

- I have assumed that one team handles dashboard and reporting.
-

---

## Additional Notes

_Anything else you'd like to share about your approach or decisions:_


