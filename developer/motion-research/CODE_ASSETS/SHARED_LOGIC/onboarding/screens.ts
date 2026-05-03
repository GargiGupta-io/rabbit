export const validOnboardingScreens = [
  'ai_1_min_video',
  'individual_or_team_prompt',
  '1_min_video',
  'connect_calendar',
  'select_main_calendar',
  'select_my_calendars',
  'choose_work_hours',
  'create_team',
  'create_recurring_tasks',
  'create_first_tasks',
  'show_tasks_in_calendar',
  'notetaker_settings',
  'choose_theme',
  'team_interception',
  'setup_ai_employees',
  'ai_pwt_and_project',
  'create_team_v2',
  'business_info',
  'whats_your_role',
] as const

export type OnboardingScreen = (typeof validOnboardingScreens)[number]
