import { SetMetadata } from '@nestjs/common';
import { Roles } from '../../users/enums/roles.enum';

export const ROLE_KEY = 'user_role';

export const Role = (role: Roles) => SetMetadata(ROLE_KEY, role);
