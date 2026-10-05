# Student Hub Suite

Build a complete, polished, responsive web application called StudentOS — an all-in-one student productivity and utility dashboard.

CORE REQUIREMENTS

Build the application so that it works without:

OpenAI API

Gemini API

Claude API

Any AI API

Any external data API

Any API key

Any paid external service

Any required backend service

Do NOT add AI features.

Do NOT add external APIs unless they are absolutely required for a browser-only local feature. Prefer implementing everything directly in the browser with JavaScript/TypeScript.

The application should be usable locally after the project is downloaded.

For the first version, use browser-side storage such as localStorage or IndexedDB for user data. Do not require a database just to use the application.

DESIGN

Create a modern, premium student-productivity interface.

Design style:

Clean

Modern

Minimal

Professional

Slightly futuristic

Smooth animations

Excellent spacing

Rounded cards

Subtle shadows

Responsive design

Desktop-first but fully mobile responsive

Accessible typography

Clear navigation

Dark/light mode

Use a consistent design system throughout the entire application.

Create a left sidebar on desktop and a responsive navigation system on mobile.

The main dashboard should feel like a real productivity operating system for students.

MAIN NAVIGATION

Create these sections:

Dashboard

Study Planner

Tasks

Focus Timer

Goals

Calculators

Expenses

Resume Builder

Code Snippets

Recipes

Workout Planner

File Tools

QR & Link Tools

Settings

DASHBOARD

Create a beautiful dashboard showing:

Greeting

Current date

Today's tasks

Upcoming assignments

Study progress

Focus time

Current goals

Expense summary

Study streak

Quick actions

Create useful dashboard cards such as:

Tasks completed today

Study hours this week

Current streak

Monthly spending

Goal progress

Allow the user to click dashboard cards and navigate to the relevant section.

STUDY PLANNER

Create a complete study planner.

Users should be able to:

Add subjects

Add exams

Add study sessions

Set dates

Set times

Set duration

Set priority

Mark sessions complete

Edit sessions

Delete sessions

View daily schedule

View weekly schedule

Track completed study time

Include:

Calendar view

Weekly timetable

Subject colors

Progress statistics

Do not use an external calendar API.

Store the data locally.

TASK / ASSIGNMENT MANAGER

Create a task manager where users can:

Create tasks

Add descriptions

Set deadlines

Set priority

Assign a category

Mark complete

Edit

Delete

Search

Filter

Categories:

Homework

Assignment

Exam

Project

Personal

Other

Show:

Today

Upcoming

Completed

Overdue

Add progress statistics.

FOCUS TIMER

Create a fully functional Pomodoro/focus timer.

Features:

25/5 default Pomodoro

Custom focus duration

Custom break duration

Start

Pause

Resume

Reset

Skip

Session counter

Daily focus statistics

Weekly focus statistics

Allow the user to connect a focus session to a task or subject.

Do not use an external timer API.

Everything should run in the browser.

GOAL TRACKER

Create a goal tracking system.

Users can:

Create goals

Set target date

Set progress

Add milestones

Mark milestones complete

Edit goals

Delete goals

Show:

Progress bars

Completion percentage

Days remaining

Completed milestones

Include daily/weekly goals.

STUDENT CALCULATORS

Create a calculator hub.

Include:

Percentage Calculator

Calculate:

Percentage from obtained/total marks

Increase/decrease percentage

CGPA Calculator

Allow multiple subjects and credits.

GPA Calculator

Allow multiple subjects and grades.

Attendance Calculator

Calculate:

Current attendance percentage

Classes attended

Classes missed

Classes required to reach target attendance

Maximum classes that can be missed while maintaining target attendance

Marks Needed Calculator

Calculate the marks needed to reach a desired percentage.

Basic Calculator

Include a normal calculator for common arithmetic.

All calculations must happen locally.

EXPENSE TRACKER

Create a simple personal expense tracker.

Users can:

Add income

Add expenses

Add categories

Edit transactions

Delete transactions

Categories:

Food

Transport

Education

Shopping

Entertainment

Bills

Other

Show:

Current balance

Total income

Total expenses

Monthly spending

Category breakdown

Recent transactions

Use charts created locally.

Do not use financial APIs.

Do not connect to bank accounts.

RESUME BUILDER

Create a resume builder that works completely in the browser.

Sections:

Personal information

Profile summary

Education

Skills

Projects

Experience

Certifications

Achievements

Languages

Contact information

Allow users to:

Add multiple entries

Edit entries

Delete entries

Reorder sections

Choose a resume layout

Preview the resume

Add a print/download option using browser printing or a client-side PDF solution.

Do not require an external resume API.

CODE SNIPPET MANAGER

Create a local code snippet manager.

Users can:

Add snippets

Add title

Select programming language

Add description

Add tags

Search snippets

Edit snippets

Delete snippets

Favorite snippets

Copy code

Support common languages:

JavaScript

TypeScript

Python

Java

C

C++

C#

HTML

CSS

SQL

PHP

Other

Use syntax highlighting if it can be implemented locally.

Do not connect to GitHub or any external API.

RECIPE MANAGER

Do NOT use a recipe API.

Instead create a built-in recipe collection and allow users to add their own recipes.

Features:

Search recipes

Filter by category

View recipe details

Ingredients

Instructions

Cooking time

Difficulty

Favorite recipes

Add custom recipes

Edit custom recipes

Delete custom recipes

Include some sample recipes in the initial application.

WORKOUT PLANNER

Do NOT use an AI workout generator or fitness API.

Create a built-in workout library.

Categories:

Full Body

Upper Body

Lower Body

Chest

Back

Arms

Core

Cardio

Beginner

Users can:

Select workouts

Create a workout plan

Set duration

Set repetitions

Set sets

Mark exercises complete

Track workout history

Include a built-in list of exercises and descriptions.

FILE TOOLS

Create browser-based file utilities where practical.

Include:

Image preview

Image compression

Image resizing

Image format conversion where browser support allows

Text file viewer

JSON formatter

JSON validator

Do not upload files to external servers.

Files should be processed locally in the browser whenever possible.

Make it clear that files are processed locally.

QR & LINK TOOLS

Create local utilities.

QR Generator:

Enter text or URL

Generate QR code

Download QR image

Link utilities:

URL validation

URL copy button

Basic URL information

Do not create a server-side URL shortener.

Do not require an external API.

If a QR library is needed, use a local package dependency rather than an external API service.

SETTINGS

Create settings for:

Dark/light mode

Accent color

Notification preferences

Default Pomodoro duration

Default break duration

Week start day

Data management

Data management should include:

Export all application data as JSON

Import application data from JSON

Clear all local data

Add a confirmation dialog before deleting all data.

LOCAL DATA

All important user-created data should persist after refreshing the page.

Use localStorage or IndexedDB.

Create a clear data structure for:

Tasks

Assignments

Study sessions

Subjects

Goals

Expenses

Resume data

Code snippets

Recipes

Workout plans

Focus sessions

Settings

Do not require authentication for the first version.

IMAGES AND ASSETS

Keep project assets organized.

Use:

public/
images/
icons/

Use local assets wherever possible.

Do NOT hotlink random images from websites.

If images are needed, place them in the project's public assets directory.

Prefer CSS shapes, icons, SVGs, and local illustrations where possible instead of requiring many image files.

Do not use copyrighted stock images unnecessarily.

Create a simple local logo/brand mark for StudentOS using SVG/CSS if possible.

CODE STRUCTURE

Keep the code clean and maintainable.

Do NOT put the entire application into one enormous component.

Use reusable components and organize the application logically.

However, keep the architecture simple enough for a beginner to understand and modify.

Use TypeScript if the project setup supports it.

Create reusable components for:

Cards

Buttons

Modals

Forms

Tables

Charts

Navigation

Empty states

Confirmation dialogs

Toast notifications

OFFLINE-FIRST BEHAVIOR

The core application should continue working without an internet connection after the application assets have loaded.

Do not make the app dependent on external APIs.

SAMPLE DATA

Include realistic sample data so the dashboard does not look empty on first launch.

Clearly mark sample data so users can remove it.

Include sample:

Subjects

Tasks

Goals

Expenses

Recipes

Workouts

Code snippets

RESPONSIVENESS

The entire application must work properly on:

Desktop

Laptop

Tablet

Mobile

On mobile:

Convert sidebar into a mobile navigation

Make tables responsive

Make cards stack appropriately

Keep buttons touch-friendly

Avoid horizontal scrolling

ERROR HANDLING

Add proper validation and helpful error messages.

Examples:

Invalid marks

Negative expenses

Empty task titles

Invalid dates

Invalid calculator input

Invalid imported JSON

Never allow invalid data to silently break the application.

IMPORTANT RESTRICTIONS

DO NOT add:

OpenAI

ChatGPT API

Gemini

Claude

AI APIs

Recipe APIs

Fitness APIs

Financial APIs

Bank APIs

Weather APIs

Social media APIs

External authentication services

Required cloud databases

Required paid services

The application should not ask the user for an API key.

If a feature can be implemented locally, implement it locally.

If a feature normally requires an API, replace it with a local implementation or remove that external dependency.

FINAL QUALITY REQUIREMENT

Do not create a basic-looking prototype.

Make StudentOS feel like a polished real-world productivity application.

Pay particular attention to:

Visual hierarchy

Spacing

Typography

Responsive behavior

Empty states

Loading states

Form validation

Animations

Navigation

Consistent components

Accessibility

Data persistence

Before considering the project complete, test every major feature and make sure refreshing the page does not delete user-created data.

The final application should be a self-contained, local-first StudentOS productivity suite with no AI API keys and no required external APIs.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://scholar-hub-desk.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e9de6e5a-fe1e-40c5-a916-380a95bb1b72).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
