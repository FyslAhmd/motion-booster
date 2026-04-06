export type NotificationMetaObjectType = 'CAMPAIGN' | 'ADSET' | 'AD';
export type NotificationNextStatus = 'ACTIVE' | 'PAUSED';
export type NotificationStatusRequestType = 'ADS_ACTIVATION_REQUEST' | 'ADS_DEACTIVATION_REQUEST';

const META_OBJECT_LABELS: Record<NotificationMetaObjectType, string> = {
  CAMPAIGN: 'Campaign',
  ADSET: 'Ad Set',
  AD: 'Ad',
};

export function getMetaObjectLabel(objectType: NotificationMetaObjectType): string {
  return META_OBJECT_LABELS[objectType];
}

export function formatMetaObjectFallbackName(
  objectType: NotificationMetaObjectType,
  objectId: string,
): string {
  return `${getMetaObjectLabel(objectType)} ${objectId}`;
}

export function getMetaAssignmentUpdateTitle(objectType?: NotificationMetaObjectType | null): string {
  if (!objectType) return 'Assignment update';
  return `${getMetaObjectLabel(objectType)} assignment update`;
}

export function buildMetaAssignmentNotificationCopy(input: {
  objectType: NotificationMetaObjectType;
  objectDisplayName: string;
  adminUsername: string;
  targetUserFullName: string;
}): {
  userTitle: string;
  userText: string;
  adminTitle: string;
  adminText: string;
} {
  const objectLabel = getMetaObjectLabel(input.objectType);

  return {
    userTitle: `${objectLabel} assignment update`,
    userText: `${objectLabel} ${input.objectDisplayName} was assigned to you by ${input.adminUsername}.`,
    adminTitle: `${objectLabel} assigned successfully`,
    adminText: `${objectLabel} ${input.objectDisplayName} assigned to ${input.targetUserFullName}.`,
  };
}

export function buildMetaStatusRequestNotificationCopy(input: {
  objectType: NotificationMetaObjectType;
  objectName: string;
  requesterFullName: string;
  nextStatus: NotificationNextStatus;
}): {
  title: string;
  text: string;
  type: NotificationStatusRequestType;
  requestedToggle: 'ON' | 'OFF';
  successMessage: string;
} {
  const objectLabel = getMetaObjectLabel(input.objectType);
  const isActivation = input.nextStatus === 'ACTIVE';

  return {
    title: `${objectLabel} ${isActivation ? 'activation' : 'pause'} request`,
    text: `${input.requesterFullName} requested to turn ${isActivation ? 'ON' : 'OFF'} ${objectLabel.toLowerCase()} ${input.objectName}.`,
    type: isActivation ? 'ADS_ACTIVATION_REQUEST' : 'ADS_DEACTIVATION_REQUEST',
    requestedToggle: isActivation ? 'ON' : 'OFF',
    successMessage: isActivation
      ? 'Activation request sent to admin. Please wait for approval.'
      : 'Pause request sent to admin. Please wait for approval.',
  };
}