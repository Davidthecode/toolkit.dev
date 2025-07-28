import { createServerToolkit } from "@/toolkits/create-toolkit";
import { baseGoogleCalendarToolkitConfig } from "./base";
import {
  googleCalendarListCalendarsToolConfigServer,
  googleCalendarGetCalendarToolConfigServer,
  googleCalendarListEventsToolConfigServer,
  googleCalendarGetEventToolConfigServer,
  googleCalendarSearchEventsToolConfigServer,
  googleCalendarCreateEventToolConfigServer,
  googleCalendarFindAvailabilityToolConfigServer,
} from "./tools/server";
import { GoogleCalendarTools } from "./tools";
import { api } from "@/trpc/server";
import { Client } from "@notionhq/client";

export const googleCalendarToolkitServer = createServerToolkit(
  baseGoogleCalendarToolkitConfig,
  `You have access to the Google Calendar toolkit for comprehensive calendar management and scheduling. This toolkit provides:

- **List Calendars**: Get all available calendars for the user
- **Get Calendar**: Retrieve detailed information about a specific calendar
- **List Events**: Get events from a calendar within a date range
- **Get Event**: Retrieve detailed information about a specific event
- **Search Events**: Find events matching specific criteria across calendars
- **Create Event**: Create new calendar events with attendees, reminders, and full configuration
- **Find Availability**: Analyze calendar availability and suggest optimal meeting times

**Find Availability Tool Guidelines:**
- When users ask for meeting availability without specifying duration, assume 60 minutes
- When no date range is specified, search from today to 7 days ahead
- When no attendees are specified, only check the user's own calendar
- **Extract time constraints from user requests**: If user says "between 1pm and 5pm", set startTime="13:00" and endTime="17:00"
- Always show the tool component when availability is requested, even with missing parameters
- Use reasonable defaults rather than asking follow-up questions

**Tool Sequencing Workflows:**
1. **Calendar Overview**: Start with List Calendars to see available calendars, then use Get Calendar for specific calendar details
2. **Event Management**: Use List Events to see upcoming events, then Get Event for detailed information about specific events
3. **Event Discovery**: Use Search Events to find events by keywords, participants, or topics across all calendars
4. **Schedule Analysis**: Combine List Events across multiple calendars to analyze scheduling patterns and availability
5. **Meeting Scheduling**: Use Find Availability to identify open time slots, then Create Event to schedule meetings with attendees
6. **Event Creation**: Create events with comprehensive details including attendees, location, reminders, and notifications

**Best Practices:**
- Always specify appropriate date ranges when listing events to avoid overwhelming results
- Use Search Events for finding specific meetings, appointments, or events by keywords
- When analyzing schedules, consider different calendar types (personal, work, shared calendars)
- Use Find Availability before creating events to ensure optimal scheduling
- When creating events, include all necessary details like attendees, location, and reminders
- Consider using appropriate visibility and transparency settings for different event types`,
  async () => {
    const account = await api.accounts.getAccountByProvider("google");
    const notionAccount = await api.accounts.getAccountByProvider("notion");

    if (!account) {
      throw new Error("No Google account found");
    }

    if (!account.access_token) {
      throw new Error("No Google access token found");
    }

    if (!notionAccount?.access_token) {
      throw new Error("No Notion account found or access token missing");
    }

    // Create Notion client
    const notion = new Client({
      auth: notionAccount.access_token,
    });

    return {
      [GoogleCalendarTools.ListCalendars]:
        googleCalendarListCalendarsToolConfigServer(account.access_token),
      [GoogleCalendarTools.GetCalendar]:
        googleCalendarGetCalendarToolConfigServer(account.access_token),
      [GoogleCalendarTools.ListEvents]:
        googleCalendarListEventsToolConfigServer(account.access_token),
      [GoogleCalendarTools.GetEvent]: googleCalendarGetEventToolConfigServer(
        account.access_token,
      ),
      [GoogleCalendarTools.SearchEvents]:
        googleCalendarSearchEventsToolConfigServer(account.access_token),
      [GoogleCalendarTools.CreateEvent]:
        googleCalendarCreateEventToolConfigServer(account.access_token),
      [GoogleCalendarTools.FindAvailability]:
        googleCalendarFindAvailabilityToolConfigServer(account.access_token, notion),
    };
  },
);
