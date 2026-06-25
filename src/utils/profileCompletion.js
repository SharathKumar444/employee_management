const hasValue = value =>
  value !== undefined &&
  value !== null &&
  String(value).trim() !== ''

const getFieldValue = (profile, keys) => {
  if (!profile) return undefined
  return keys.map(key => profile[key]).find(hasValue)
}

const getNameParts = profile => {
  const rawName = getFieldValue(profile, [
    'first_name',
    'firstName',
    'name',
  ])

  if (!hasValue(rawName)) {
    return []
  }

  return String(rawName)
    .trim()
    .split(/\s+/)
}

export const getProfileCompletionScore = profile => {
  if (!profile) {
    return 0
  }

  const nameParts = getNameParts(profile)
  const firstNameComplete =
    hasValue(profile?.first_name) ||
    hasValue(profile?.firstName) ||
    nameParts.length > 0
  const lastNameComplete =
    hasValue(profile?.last_name) ||
    hasValue(profile?.lastName) ||
    nameParts.length > 1
  const emailComplete =
    hasValue(profile?.email) ||
    hasValue(profile?.user_email)
  const phoneComplete =
    hasValue(profile?.phone) ||
    hasValue(profile?.phone_number) ||
    hasValue(profile?.phoneNumber)
  const departmentComplete = hasValue(profile?.department)
  const designationComplete = hasValue(profile?.designation)
  const pictureComplete =
    hasValue(profile?.profile_picture) ||
    hasValue(profile?.profilePicture) ||
    hasValue(profile?.avatar)
  const addressComplete = hasValue(profile?.address)
  const joinedComplete =
    hasValue(profile?.date_of_joining) ||
    hasValue(profile?.dateOfJoining) ||
    hasValue(profile?.joining_date) ||
    hasValue(profile?.date_joined)
  const employeeIdComplete =
    hasValue(profile?.employee_id) ||
    hasValue(profile?.employeeId)

  const completedFields = [
    firstNameComplete,
    lastNameComplete,
    emailComplete,
    phoneComplete,
    departmentComplete,
    designationComplete,
    pictureComplete,
    addressComplete,
    joinedComplete,
    employeeIdComplete,
  ].filter(Boolean).length

  return Math.round((completedFields / 10) * 100)
}

export const getMissingProfileFields = profile => {
  if (!profile) {
    return [
      'First Name',
      'Last Name',
      'Email',
      'Phone Number',
      'Department',
      'Designation',
      'Profile Picture',
      'Address',
      'Date of Joining',
      'Employee ID',
    ]
  }

  const nameParts = getNameParts(profile)
  const fields = [
    {
      label: 'First Name',
      complete:
        hasValue(profile?.first_name) ||
        hasValue(profile?.firstName) ||
        nameParts.length > 0,
    },
    {
      label: 'Last Name',
      complete:
        hasValue(profile?.last_name) ||
        hasValue(profile?.lastName) ||
        nameParts.length > 1,
    },
    {
      label: 'Email',
      complete:
        hasValue(profile?.email) ||
        hasValue(profile?.user_email),
    },
    {
      label: 'Phone Number',
      complete:
        hasValue(profile?.phone) ||
        hasValue(profile?.phone_number) ||
        hasValue(profile?.phoneNumber),
    },
    {
      label: 'Department',
      complete: hasValue(profile?.department),
    },
    {
      label: 'Designation',
      complete: hasValue(profile?.designation),
    },
    {
      label: 'Profile Picture',
      complete:
        hasValue(profile?.profile_picture) ||
        hasValue(profile?.profilePicture) ||
        hasValue(profile?.avatar),
    },
    {
      label: 'Address',
      complete: hasValue(profile?.address),
    },
    {
      label: 'Date of Joining',
      complete:
        hasValue(profile?.date_of_joining) ||
        hasValue(profile?.dateOfJoining) ||
        hasValue(profile?.joining_date) ||
        hasValue(profile?.date_joined),
    },
    {
      label: 'Employee ID',
      complete:
        hasValue(profile?.employee_id) ||
        hasValue(profile?.employeeId),
    },
  ]

  return fields
    .filter(field => !field.complete)
    .map(field => field.label)
}

export const getProfileCompletionStatus = score => {
  if (score === 100) {
    return 'Complete'
  }

  if (score >= 80) {
    return 'Incomplete'
  }

  return 'Needs Attention'
}
