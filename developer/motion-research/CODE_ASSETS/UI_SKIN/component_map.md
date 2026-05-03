# Motion Component Map (Extracted from appBar chunk)

## Functional Components
- `Jc`: Agenda (The main list of today's events)
- `Gt`: Entity Switcher (Renders Task, Event, or Chunk)
- `qc`: TaskRow (Includes complete/open logic)
- `Uc`: EventRow (Includes join meeting/notetaker logic)
- `Xc`: QuickMeeting Form
- `Kc`: New Button (Task, Doc, Project, Event)

## Data Structures
- `ScheduledEntityWithRelations`: The base object for everything on the calendar.
- `Agenda`: Array of `ScheduledEntityWithRelations` filtered by date.
- `MeetingInsights`: Data associated with events for the Notetaker.
