ALTER TABLE ONLY public."users"
    ADD COLUMN "subscribedPodcastListIds" character varying[] DEFAULT ARRAY[]::text[] NOT NULL;