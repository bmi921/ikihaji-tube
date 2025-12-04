-- "USING id::uuid" は「今のidの値をuuid型にキャストして変換に使ってね」という命令です
ALTER TABLE "viewing_history" ALTER COLUMN "id" SET DATA TYPE uuid USING id::uuid;
ALTER TABLE "viewing_history" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();