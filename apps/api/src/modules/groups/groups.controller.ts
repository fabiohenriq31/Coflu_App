import type { RequestHandler } from 'express';

import { AppError } from '../../utils/app-error.js';
import {
  createGroupSchema,
  groupParamsSchema,
  inviteMemberSchema,
  memberParamsSchema,
  updateGroupSchema,
  updateMemberRoleSchema,
} from './groups.schemas.js';
import { groupsService } from './groups.service.js';

const getAuthenticatedUserId = (request: Parameters<RequestHandler>[0]) => {
  if (!request.user) {
    throw new AppError('Authentication token is required', 401);
  }

  return request.user.id;
};

export const createGroup: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const input = createGroupSchema.parse(request.body);
    const group = await groupsService.createGroup(userId, input);

    return response.status(201).json({ group });
  } catch (error) {
    return next(error);
  }
};

export const listGroups: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const groups = await groupsService.listGroups(userId);

    return response.status(200).json({ groups });
  } catch (error) {
    return next(error);
  }
};

export const getGroup: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = groupParamsSchema.parse(request.params);
    const group = await groupsService.getGroup(userId, groupId);

    return response.status(200).json({ group });
  } catch (error) {
    return next(error);
  }
};

export const updateGroup: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = groupParamsSchema.parse(request.params);
    const input = updateGroupSchema.parse(request.body);
    const group = await groupsService.updateGroup(userId, groupId, input);

    return response.status(200).json({ group });
  } catch (error) {
    return next(error);
  }
};

export const deleteGroup: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = groupParamsSchema.parse(request.params);

    await groupsService.deleteGroup(userId, groupId);

    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
};

export const listMembers: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = groupParamsSchema.parse(request.params);
    const members = await groupsService.listMembers(userId, groupId);

    return response.status(200).json({ members });
  } catch (error) {
    return next(error);
  }
};

export const inviteMember: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId } = groupParamsSchema.parse(request.params);
    const input = inviteMemberSchema.parse(request.body);
    const member = await groupsService.inviteMember(userId, groupId, input);

    return response.status(201).json({ member });
  } catch (error) {
    return next(error);
  }
};

export const updateMemberRole: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId, memberId } = memberParamsSchema.parse(request.params);
    const input = updateMemberRoleSchema.parse(request.body);
    const member = await groupsService.updateMemberRole(userId, groupId, memberId, input);

    return response.status(200).json({ member });
  } catch (error) {
    return next(error);
  }
};

export const removeMember: RequestHandler = async (request, response, next) => {
  try {
    const userId = getAuthenticatedUserId(request);
    const { groupId, memberId } = memberParamsSchema.parse(request.params);
    const member = await groupsService.removeMember(userId, groupId, memberId);

    return response.status(200).json({ member });
  } catch (error) {
    return next(error);
  }
};
