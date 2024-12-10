import { PrivilegeCode } from '../../api';

export interface NavItem {
    label: string;             // Display label for the navbar
    path: string;              // Route path
    privilege?: string;        // Required privilege
    isEnabled: boolean;     // Whether to show in the navbar
}

export const NAV_ITEMS: NavItem[] = [
    { label: 'Add Student', path: 'addStudent', privilege: PrivilegeCode.SecretaryPrivilege, isEnabled: true },
    { label: 'Doctor', path: 'doctor', privilege: PrivilegeCode.DoctorPrivilege, isEnabled: true },
    { label: 'Admin', path: 'admin', privilege: PrivilegeCode.AdminPrivilege, isEnabled: true },
    { label: 'Add User', path: 'addUser', privilege: PrivilegeCode.AdminPrivilege, isEnabled: true },
    { label: 'Student', path: 'student', privilege: PrivilegeCode.StudentPrivilege, isEnabled: true },
    { label: 'Assistant', path: 'assistant', privilege: PrivilegeCode.AssistantPrivilege, isEnabled: true },
    { label: 'Labs', path: 'labs', privilege: PrivilegeCode.LabMaintenancePrivilege, isEnabled: true },
];
