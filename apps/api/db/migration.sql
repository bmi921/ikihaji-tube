CREATE TABLE public.groups (
  id bigint NOT NULL,
  CONSTRAINT groups_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id bigint NOT NULL,
  group_id bigint,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)
);
CREATE TABLE public.videos (
  id text NOT NULL,
  title text NOT NULL,
  thumbnail_url text NOT NULL,
  CONSTRAINT videos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.viewing_history (
  id integer NOT NULL DEFAULT nextval('viewing_histories_id_seq'::regclass),
  user_id bigint,
  video_id text,
  CONSTRAINT viewing_history_pkey PRIMARY KEY (id),
  CONSTRAINT viewing_histories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT viewing_histories_video_id_fkey FOREIGN KEY (video_id) REFERENCES public.videos(id)
);