export type AuthStackParamList = {
  Welcome: undefined;
  SignIn:  undefined;
  SignUp:  undefined;
};

export type NotebookStackParamList = {
  NotebookHome:  undefined;
  PrayerDetail:  { prayerId: string };
  AddEditPrayer: { prayerId?: string }; // undefined = new prayer
};

export type ScheduleStackParamList = {
  ScheduleHome:   undefined;
  AddEditSession: { sessionId?: string };
};

export type RootTabParamList = {
  Home:     undefined;
  Notebook: undefined;
  Schedule: undefined;
  Profile:  undefined;
};
