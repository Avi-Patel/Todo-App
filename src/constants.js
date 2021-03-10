export const todoActions = {
  //
  EDIT: "edit",
  ALTER_COMPLETION_IN_BULK: "alterCompletionInBulk",
  CREATE: "create",
  DELETE: "delete",
  SELECT: "select",
  MARK_COMPLETED: "markCompleted",
  DELETE_IN_BULK: "deleteInBulk",
};

export const categoryIcon = {
  USERALT: "fa-user",
  BOOKOPEN: "fa-book",
  USERS: "fa-users",
};

export const color = {
  GREEN: "cgreen",
  YELLOW: "cyellow",
  RED: "cred",
};

export const category = {
  PERSONAL: "personal",
  ACADEMIC: "academic",
  SOCIAL: "social",
};
export const urgency = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

export const filterNames = {
  URGENCY: "urgency",
  CATEGORY: "category",
};

export const INVALID_POSITION = -1;

export const urgencyOptions = [urgency.LOW, urgency.MEDIUM, urgency.HIGH];
export const categoryOptions = [category.PERSONAL, category.ACADEMIC, category.SOCIAL];
