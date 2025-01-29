-- Remove all existing florist profiles and related data
DELETE FROM florist_profiles;

-- Remove florist role from profiles
UPDATE profiles
SET role = 'customer'
WHERE role = 'florist';

-- Remove florist role from auth.users metadata
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE raw_user_meta_data->>'role' = 'florist';
