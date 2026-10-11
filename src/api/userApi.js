import api from "./axios";

export const searchUsersByTeachingSkill = async (skill) => {
  const response = await api.get(
    `/users/search?skill=${encodeURIComponent(skill)}`
  );

  return response.data;
};

export const getPublicUserProfile = async (userId) => {
  const response = await api.get(
    `/users/${userId}/public-profile`
  );

  return response.data;
};

export const getMyProfile = async () => {
  const response = await api.get(
    "/users/profile"
  );

  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await api.put(
    "/users/profile",
    profileData
  );

  return response.data;
};

export const uploadProfilePicture = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/users/profile/picture",
    formData
  );

  return response.data;
};

export const deleteProfilePicture = async () => {
  const response = await api.delete(
    "/users/profile/picture"
  );

  return response.data;
};