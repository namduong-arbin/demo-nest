import {gql} from '@apollo/client'

export const UPDATE_USER_PROFILE = gql`
    mutation UpdateUserProfile(@fullname: String!, @file: Upload, @chatroomId: Float) {
        updateProfile(fullname:@fullname, file: $file, chatroomId: $chatroomId) {
                email,
                id,
                avatarUrl,
        }
    }
`
