export * from './auth.service';
import { AuthService } from './auth.service';
export * from './privilege.service';
import { PrivilegeService } from './privilege.service';
export * from './user.service';
import { UserService } from './user.service';
export * from './userType.service';
import { UserTypeService } from './userType.service';
export const APIS = [AuthService, PrivilegeService, UserService, UserTypeService];
