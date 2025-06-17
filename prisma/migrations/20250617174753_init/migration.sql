BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Event] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [type] NVARCHAR(1000) NOT NULL,
    [startTime] DATETIME2 NOT NULL,
    [endTime] DATETIME2 NOT NULL,
    [color] NVARCHAR(1000),
    [createdById] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Event_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Event_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [message] NVARCHAR(1000) NOT NULL,
    [read] BIT NOT NULL CONSTRAINT [Notification_read_df] DEFAULT 0,
    [type] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [userById] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Conversation] (
    [id] NVARCHAR(1000) NOT NULL,
    [number] NVARCHAR(1000) NOT NULL,
    [thread] NVARCHAR(1000) NOT NULL,
    [model] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Conversation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Conversation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Conversation_number_key] UNIQUE NONCLUSTERED ([number])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Event_createdById_idx] ON [dbo].[Event]([createdById]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Notification_userById_idx] ON [dbo].[Notification]([userById]);

-- AddForeignKey
ALTER TABLE [dbo].[Event] ADD CONSTRAINT [Event_createdById_fkey] FOREIGN KEY ([createdById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userById_fkey] FOREIGN KEY ([userById]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
