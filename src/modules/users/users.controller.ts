import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users', description: 'Access: ADMIN only' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @Roles(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get current user profile', description: 'Access: VIEWER, ANALYST, ADMIN' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Get('me/summary')
  @Roles(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get financial summary for current user', description: 'Access: VIEWER, ANALYST, ADMIN' })
  @ApiResponse({ status: 200, description: 'Income, expense, balance totals' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSummary(@CurrentUser() user: any) {
    return this.usersService.getSummary(user.id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user role', description: 'Access: ADMIN only. Role must be VIEWER, ANALYST, or ADMIN.' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }
}
