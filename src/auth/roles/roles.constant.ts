export const USER_ROLE = {
    ROLE_USER: 10,
    ROLE_REFERRAL: 20,
    ROLE_AGENT: 30,
    ROLE_INFLUENCET: 40,
    ROLE_OAP: 50,
    ROLE_STATION: 60,
    ROLE_ADMIN: 6,
  } as const;
  
  export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
  