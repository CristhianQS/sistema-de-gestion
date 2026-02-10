CREATE TABLE public.areas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  description text,
  image_url text,
  encargado_email text,
  encargado_nombre text,
  CONSTRAINT areas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chatbot_config (
  id bigint NOT NULL DEFAULT nextval('chatbot_config_id_seq'::regclass),
  config_key character varying NOT NULL UNIQUE,
  config_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chatbot_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.data_alumnos (
  id bigint NOT NULL,
  dni text,
  codigo bigint,
  estudiante text,
  carrera_profesional text,
  facultad text,
  modalidad text,
  ciclo bigint,
  grupo text,
  celular text,
  religion text,
  fecha_nacimiento text,
  correo text,
  pais text,
  CONSTRAINT data_alumnos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.docentes (
  id bigint NOT NULL DEFAULT nextval('docentes_id_seq'::regclass),
  nombres text NOT NULL,
  apellidos text NOT NULL,
  dni text NOT NULL UNIQUE,
  email text,
  telefono text,
  especialidad text,
  departamento text,
  estado text DEFAULT 'activo'::text CHECK (estado = ANY (ARRAY['activo'::text, 'inactivo'::text, 'licencia'::text])),
  fecha_ingreso date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT docentes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.pabellones (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  imagen_url text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pabellones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_user (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  name text,
  area_id bigint,
  role text DEFAULT 'admin_plata'::text,
  dni text,
  CONSTRAINT admin_user_pkey PRIMARY KEY (id),
  CONSTRAINT fk_area_id FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
CREATE TABLE public.area_fields (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  area_id bigint NOT NULL,
  field_name text NOT NULL,
  field_type text NOT NULL,
  field_label text NOT NULL,
  is_required boolean DEFAULT true,
  options text,
  placeholder text,
  order_index integer DEFAULT 0,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT area_fields_pkey PRIMARY KEY (id),
  CONSTRAINT fk_area_id FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
CREATE TABLE public.area_submissions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  area_id bigint NOT NULL,
  alumno_id bigint,
  alumno_dni text NOT NULL,
  alumno_codigo bigint NOT NULL,
  alumno_nombre text NOT NULL,
  form_data jsonb NOT NULL,
  submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status text DEFAULT 'pending'::text,
  reviewed boolean DEFAULT false,
  reviewed_at timestamp with time zone,
  reviewed_by text,
  es_docente boolean DEFAULT false,
  docente_dni text,
  docente_nombre text,
  docente_id bigint,
  prioridad text DEFAULT 'normal'::text CHECK (prioridad = ANY (ARRAY['normal'::text, 'alta'::text, 'urgente'::text])),
  CONSTRAINT area_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT fk_area_id FOREIGN KEY (area_id) REFERENCES public.areas(id),
  CONSTRAINT area_submissions_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.docentes(id),
  CONSTRAINT fk_alumno_id FOREIGN KEY (alumno_id) REFERENCES public.data_alumnos(id)
);



CREATE TABLE public.notifications (
  id bigint NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  user_email text NOT NULL,
  user_name text,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info'::text,
  related_submission_id bigint,
  related_area_id bigint,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_related_submission_id_fkey FOREIGN KEY (related_submission_id) REFERENCES public.area_submissions(id),
  CONSTRAINT notifications_related_area_id_fkey FOREIGN KEY (related_area_id) REFERENCES public.areas(id)
);

CREATE TABLE public.salones (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  pabellon_id bigint NOT NULL,
  nombre text NOT NULL,
  capacidad integer,
  descripcion text,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT salones_pkey PRIMARY KEY (id),
  CONSTRAINT fk_pabellon_id FOREIGN KEY (pabellon_id) REFERENCES public.pabellones(id)
);
CREATE TABLE public.selection_options (
  id integer NOT NULL DEFAULT nextval('selection_options_id_seq'::regclass),
  area_id integer NOT NULL,
  group_name text NOT NULL,
  option_value text NOT NULL,
  option_label text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT selection_options_pkey PRIMARY KEY (id),
  CONSTRAINT selection_options_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
CREATE TABLE public.user_areas (
  id bigint NOT NULL DEFAULT nextval('user_areas_id_seq'::regclass),
  user_id bigint NOT NULL,
  area_id bigint NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_areas_pkey PRIMARY KEY (id),
  CONSTRAINT user_areas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_user(id),
  CONSTRAINT user_areas_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id)
);