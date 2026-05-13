---
slug: "trash-detector"
title: "Trash Detector with YOLOv8"
date: "2024-03-16"
description: "A computer vision project using a fine-tuned YOLOv8 model to detect trash and recycling in images."
quote: "The greatest threat to our planet is the belief that someone else will save it."
quoteAuthor: "Robert Swan"
category: "Computer Vision"
---

This was my first computer vision project and it was a lot of fun! Throughout this project I had to learn how to convert a dataset from COCO form to a YOLO form, utilize bash scripts to do multi-GPU training on a super computer, and build a streamlit app to allow for interactive use!

Here is a video of how my project works! (Built with a streamlit app!)

<figure class="flex flex-col items-center my-8">
    <video width="100%" height="auto" controls class="rounded-none shadow-2xl border border-foreground/5">
        <source src="/projects_files/trash_detector/trash_detector_demo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
    </video>
    <figcaption class="mt-4 text-center italic opacity-60"><b>Figure 1:</b> A video of the trash detector in action.</figcaption>
</figure>
