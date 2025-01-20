import { PrivilegeCode } from '../../api';

export interface NavItem {
    label: string;             // Display label for the navbar
    path: string;              // Route path
    privilege?: string;        // Required privilege
    isEnabled: boolean;     // Whether to show in the navbar
}

export const NAV_ITEMS: NavItem[] = [
    { label: 'Add Student', path: 'addStudent', privilege: PrivilegeCode.CreateStudent, isEnabled: true },
    { label: 'Doctor', path: 'doctor', privilege: PrivilegeCode.TeachCourse, isEnabled: true },
    { label: 'User Types', path: 'admin', privilege: PrivilegeCode.ManageUserTypes, isEnabled: true },
    { label: 'Add User', path: 'addUser', privilege: PrivilegeCode.ManageUsers, isEnabled: true },
    { label: 'Student', path: 'student', privilege: PrivilegeCode.StudyCourse, isEnabled: true },
    { label: 'Assistant', path: 'assistant', privilege: PrivilegeCode.AssistInCourse, isEnabled: true },
    { label: 'Labs', path: 'labs', privilege: PrivilegeCode.LabMaintenance, isEnabled: true },
];
