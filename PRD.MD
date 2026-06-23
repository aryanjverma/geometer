# Geometer, A Brilliant Clone

## MVP

Geometer is an interactive learning app for 6th graders to learn geometry with visual components they can play with. 6th graders can sign in/create an account, and progress through the 5 lessons that build up on each other and see their progress in the progress bar. Additionally, users can maintain their Geometer streak by completing a lesson each day. 

**MVP Boundaries:**
- There are 5 lessons each covering a lesson of geometry which are specified below
- Auth: Google OAuth only; unauthenticated users see the login gate only 

## Persona

6th graders who are tired with traditional geometry lessons and want a more hands-on experience they can play with on their browser

## User Stories

- As Johnny, a 6th grader who hates his geometry class for being too fast, I want to learn geometry with lessons that adapt to my own pace so that I can obtain a better understanding of geometry without being overwhelmed. 
- As Sally, a 6th grader who thinks my geometry class is too slow, I want to be able to go ahead of my classmates so that I can learn more advanced geometry concepts at my own pace. 
- As Robert, a 6th grader who doesn't understand the Pythogrean theorem, I want a diagram that visually explains it to me using concepts I do understand so I can grasp the concept beyond a memorization level. 
- As Jill, a 6th grader who keeps getting problems about circumference wrong, I want a system that detects where my weak points are so that I can focus on them and improve on them.
- As Edward, a 6th grader who is not motivated by learning, I want a streak-based system that pressures me to keep learning so that I can compete with my friends to see who can keep the biggest streak. 

## Pages

**Unauthenticated**:
- Login page gate: users must sign in/create an account on this page (uses Google OAuth)

**Authenticated (in a 3 page router)**:
- Landing page/dashboard: authenticated users see this, which shows a progress bar at the top showing what percent of the lessons are completed, and under has a button to click on the lessons 1-5, which are either locked if the previous lessons are not completed, can be reviewed if they are already done, or they are the newest lesson
- Leaderboard page: leaderboard based on streaks (your own avatar would be highlighted as opposed to others)
- Account page: users can choose to add a profile picture, change their name, and choose to delete their account (with a warning)

**Lesson (in a separate individual view)**:
- The core lessons which will have the content and visuals for users to learn and solve problems

## Functional Requirements

### FR-1: Login page
- Google OAuth
- All app routes except `/login` require auth; redirect unauthenticated users
- **Acceptance:** A signed-out user cannot reach any other pages; sign-in lands on the dashboard

### FR-1.5: Authenticted Navigator
- Create a skeleton for authetnicated navigation with 3 placeholders for the dashboard, leaderboard, and account page

### FR-2: Dashboard
- Create a progress bar highlighting how many of the 5 lessons are completed
- Have the 5 lessons under it all next to each other, and have them locked unless previous ones are completed
- To enter each lesson, you need to click a button that either says Review for already completed lesson, Start for new lessons, and Locked for locked lessons

### FR-3: Lessons
- Lessons must be persistent, meaning if somebody leaves they can come back and it will be on the same question
- Lessons are on a different view external from the navigator
- Lesson 1: Quadrilaterals 1 (parallelograms, rhombus)
    - Students must learn area and perimeter of these (Area=bh, Perimeter=2m+2n , if rhombus m=n so P=4m)
    - Make sure to have interactives with parallelograms where users can move vertices around to understand what parallelograms and rhombi are, probably have on where they turn a parallelogrm to a rhombus (make sides equal)
    - Students tested on questions of area, perimeter, and if a rhombus is a parallelogram
- Lesson 2: Quadrilaterals 2 (rectangles, squares)
    - Students must learn area and perimeter of these (area=bh or s^2, perimeter=2m+2n or 4s)
    - Students have an interactive where they turn a parallelogram into a square by moving vertices
    - Students tested on area, perimeter, and set questions of parallelograms, rectangles, rhombi, and squares (in 6th grade teminology)
- Lesson 3: Quadrilaterals/Triangles 3 (trapezoids, right triangle area)
    - Students learn area and perimeter of regular and non regular trapezoids and also right triangles
    - The interactive could be splitting a double right angled trapezoid into a rectnalge and a right triangle and solving for them individually to get the area
    - Students tested on area, perimeter and set questions of parallelograms, rectangles, rhombi, trapezoids, and squares (in 6th grade teminology)
- Lesson 4: Triangles 1 (non-right triangles)
- Lesson 5: Triangles 2 (right triangles, pythogrean theorem)