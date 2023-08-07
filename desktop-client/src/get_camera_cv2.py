#   Reference : https://www.geeksforgeeks.org/python-opencv-capture-video-from-camera/
#
#   Written By : Elijah Masanga & Francis Ruambo
#
#   Date : 27th December 2021   


# import the opencv library
import os
import sys
import cv2

file_id = sys.argv[1]

# define a video capture object
vid = cv2.VideoCapture(0)
    
# Capture the video frame
# by frame
ret, frame = vid.read()

# Save Image In cam_imgs Location
cv2.imwrite("src/cam_imgs/cam_img_"+file_id+".jpg", frame)

# After the loop release the cap object
vid.release()