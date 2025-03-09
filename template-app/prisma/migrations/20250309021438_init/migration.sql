-- CreateTable
CREATE TABLE "USER_TBL" (
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lineUserName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USER_TBL_pkey" PRIMARY KEY ("userId")
);
