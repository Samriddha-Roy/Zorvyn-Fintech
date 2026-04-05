export declare enum UserRole {
    VIEWER = "VIEWER",
    ANALYST = "ANALYST",
    ADMIN = "ADMIN"
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}
