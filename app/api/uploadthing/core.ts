import { currentUser } from "@clerk/nextjs/server";
import { UploadThingError } from "uploadthing/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      const user = await currentUser();

      if (!user) throw new UploadThingError("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("upload completed for user id", metadata.userId);
      console.log("file url", file.ufsUrl);

      console.log("Skipping server-side PDF processing due to network constraints");
      console.log("PDF will be processed client-side with fallback mechanisms");

      return {
        userId: metadata.userId,
        fileKey: file.key,
        fileName: file.name,
        fileUrl: file.url,
        ufsUrl: file.ufsUrl,
        processed: false,
        skipServerProcessing: true,
        message: "File uploaded successfully. Processing will be handled client-side.",
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
