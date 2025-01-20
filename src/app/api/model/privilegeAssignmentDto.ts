/**
 * ASU Science Management
 *
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { PrivilegeCode } from "./privilegeCode";


export interface PrivilegeAssignmentDto {
    code: PrivilegeCode;
    friendlyName: string;
    group: string;
    requiresResource: boolean;
    paramKey: string;
    entityName: string;
    resourceIds?: Array<string>;
}



