Password: greSQL database dump
--

\restrict uDfIa9ldOsmkrWITAcj8fXWObNqAHqk7Ek5CD6c3ziefghKwosGqTg2GwzKczZB

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.9 (Debian 17.9-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.installments DROP CONSTRAINT IF EXISTS installments_expenses_id_fkey;
ALTER TABLE IF EXISTS ONLY public.recipes DROP CONSTRAINT IF EXISTS recipes_pkey;
ALTER TABLE IF EXISTS ONLY public.installments DROP CONSTRAINT IF EXISTS installments_pkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
DROP TABLE IF EXISTS public.recipes;
DROP TABLE IF EXISTS public.installments;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public."TransactionType";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'TRANSPORT',
    'OTHERS',
    'STUDIES',
    'RESIDENCE',
    'CREDIT'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expenses (
    id uuid NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    category public."TransactionType" NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isFixed" boolean DEFAULT false NOT NULL,
    "numberOfInstallments" integer
);


--
-- Name: installments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.installments (
    id uuid NOT NULL,
    "isPaid" boolean DEFAULT false NOT NULL,
    "dueDate" date NOT NULL,
    expenses_id uuid NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(6) with time zone NOT NULL,
    value_installment_of_expense numeric(10,2) NOT NULL
);


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id uuid NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    "createdAt" timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a5405aa6-e02b-40ae-af8c-3a2c53b25449	1ea3c1a39d640e6991eb420ba6ce122a54198f077b5332aaa0b94312c7507d67	2026-02-27 17:51:51.400163+00	20251004190556_tabela_de_categorias	\N	\N	2026-02-27 17:51:51.392257+00	1
461f72eb-eee3-491f-a616-db2f168e6bba	aecb797aed1560796353cdfe565e9693cbbc921c43b93dbff232d3e3663d10fd	2026-02-27 17:51:51.411366+00	20251004193234_nova_tabela_de_despesas	\N	\N	2026-02-27 17:51:51.402896+00	1
69a5eadb-8b77-41a5-a915-2582a0b6cc5b	7d8c8be6ab13f0eda60d00a4cdd61e73c107969a6a0db4d29f6fcb36d5d19523	2026-02-27 17:51:51.421408+00	20251006160517_adicionando_nova_tabela	\N	\N	2026-02-27 17:51:51.412856+00	1
92f36f68-650c-40db-ba6d-1209344375a0	a73251752cd0b274a758710d8c59d1d074d110a4bdcf11df53ec4b40fd639d6d	2026-02-27 17:51:51.429595+00	20251012145535_adicionando_campos_na_tabela_de_despesasadd	\N	\N	2026-02-27 17:51:51.422961+00	1
c7719b75-bbf3-4d30-9173-005350e4bfe6	10e86932c435a3012139940634964ba17c8fbbb88225481f4daa84522901fe13	2026-02-27 17:51:51.438847+00	20251012163052_nova_coluna_para_guardar_as_parcelas	\N	\N	2026-02-27 17:51:51.431059+00	1
70acd83b-36f1-4550-b926-37083fe629b8	75c516784b66626fc93f81f111db61796f6159d40206699b17337db1f6461f57	2026-02-27 17:51:51.44837+00	20251012170943_adicionando_on_cascade	\N	\N	2026-02-27 17:51:51.441495+00	1
91251184-373f-4a1c-afe8-b08dc1893c22	f96389ed3e4735bdde6e9aa5d952097297474a900734f6b5aba4973445ac19b5	2026-02-27 17:51:51.456639+00	20251013132048_adicionando_o_campo_de_valor_da_parcela	\N	\N	2026-02-27 17:51:51.449995+00	1
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expenses (id, description, amount, category, "createdAt", "isFixed", "numberOfInstallments") FROM stdin;
66258d83-9806-4daa-9d26-42592ff40236	Projetor	607.98	OTHERS	2026-02-27 18:46:19.103+00	f	6
ea77a87f-ec47-4844-b8e1-598f7cdc0f17	Mercado	250.00	OTHERS	2026-02-27 19:12:11.873+00	t	\N
91a90bf3-c8e1-4010-a733-9af28bfa431d	Internet	100.00	RESIDENCE	2026-02-27 19:14:57.614+00	f	2
07567ad4-dd12-458d-9933-191ded57be1e	Financiamento da moto	1352.00	CREDIT	2026-02-27 19:18:12.562+00	f	2
e7693cd8-1dd5-4704-bc35-dd7d0601da88	Água	40.00	RESIDENCE	2026-02-27 19:33:29.745+00	t	\N
29489354-2c09-479e-a5cd-bf46c0813f8b	Academia	80.00	OTHERS	2026-02-27 19:37:39.237+00	t	\N
60f04dee-7737-4067-a2f2-2f3a328f111b	Energia	130.00	RESIDENCE	2026-02-27 19:38:25.125+00	t	\N
2435280f-a345-4e5b-a24a-9a7892441503	Gasolina	100.00	TRANSPORT	2026-02-27 19:42:57.956+00	t	\N
7daeda27-5ac6-40cf-9967-930e46125e3f	Anel de noivado	489.00	OTHERS	2026-02-28 13:24:24.499+00	f	3
59ac8107-c6c4-4a70-b45d-6a49d271f942	Perfume	45.00	OTHERS	2026-02-28 13:26:07.019+00	f	1
691ba036-1b9f-420e-9c6e-0c110b949ab9	Açougue	170.00	OTHERS	2026-02-28 13:59:11.131+00	t	\N
\.


--
-- Data for Name: installments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.installments (id, "isPaid", "dueDate", expenses_id, "createdAt", "updatedAt", value_installment_of_expense) FROM stdin;
0bfe9d1d-da86-43e0-823b-56e09424253c	f	2026-03-25	07567ad4-dd12-458d-9933-191ded57be1e	2026-02-27 19:18:12.567+00	2026-02-27 19:18:12.567+00	676.00
a58fe89f-3975-454c-8cdc-05fc141c05ea	f	2026-04-25	07567ad4-dd12-458d-9933-191ded57be1e	2026-02-27 19:18:12.567+00	2026-02-27 19:18:12.567+00	676.00
0c4cdd28-8a8c-4bf3-8ab7-4a8827b11f67	f	2026-06-11	66258d83-9806-4daa-9d26-42592ff40236	2026-02-27 18:46:19.223+00	2026-02-27 19:28:42.591+00	101.33
10288216-d9cc-4c5a-892c-517b7b3469bc	f	2026-04-11	66258d83-9806-4daa-9d26-42592ff40236	2026-02-27 18:46:19.223+00	2026-02-27 19:28:42.591+00	101.33
2c4ae500-8f5c-4840-b618-b4f48e32d690	f	2026-07-11	66258d83-9806-4daa-9d26-42592ff40236	2026-02-27 18:46:19.223+00	2026-02-27 19:28:42.591+00	101.33
455b3c64-ff37-472f-8ee9-422d04724feb	f	2026-03-10	91a90bf3-c8e1-4010-a733-9af28bfa431d	2026-02-27 19:14:57.618+00	2026-02-27 19:28:42.591+00	50.00
4f145702-c21d-42d9-849f-d1cc4b45564f	f	2026-03-11	66258d83-9806-4daa-9d26-42592ff40236	2026-02-27 18:46:19.223+00	2026-02-27 19:28:42.591+00	101.33
c9e461c5-4714-4157-828a-ff3083d3d24b	f	2026-04-10	91a90bf3-c8e1-4010-a733-9af28bfa431d	2026-02-27 19:14:57.618+00	2026-02-27 19:28:42.591+00	50.00
eb8c056d-f355-4277-8b2f-e507e168554b	f	2026-08-11	66258d83-9806-4daa-9d26-42592ff40236	2026-02-27 18:46:19.223+00	2026-02-27 19:28:42.591+00	101.33
fb96f551-57e1-4d1c-8a50-20c5ef5a9d98	f	2026-05-11	66258d83-9806-4daa-9d26-42592ff40236	2026-02-27 18:46:19.223+00	2026-02-27 19:28:42.591+00	101.33
43add2a2-ee89-46f9-bb29-b9274641f17a	f	2026-04-05	7daeda27-5ac6-40cf-9967-930e46125e3f	2026-02-28 13:24:24.523+00	2026-02-28 13:24:24.523+00	163.00
0737218b-f2c5-4cf3-be43-4250bbba8310	f	2026-05-05	7daeda27-5ac6-40cf-9967-930e46125e3f	2026-02-28 13:24:24.523+00	2026-02-28 13:24:24.523+00	163.00
92917383-c186-4231-bb04-1a60329a11e5	f	2026-03-05	59ac8107-c6c4-4a70-b45d-6a49d271f942	2026-02-28 13:26:07.022+00	2026-02-28 13:26:07.022+00	45.00
084edbd9-3b3a-48fc-b3e5-77d2ae878030	t	2026-02-28	ea77a87f-ec47-4844-b8e1-598f7cdc0f17	2026-02-28 15:01:30.991+00	2026-02-28 15:01:30.991+00	250.00
243ed230-0b93-46ba-bb45-38488c8bb213	t	2026-02-28	e7693cd8-1dd5-4704-bc35-dd7d0601da88	2026-02-28 15:01:30.991+00	2026-02-28 15:01:30.991+00	40.00
96025789-6d7d-4837-ae9d-ae531b4d22bf	t	2026-02-28	29489354-2c09-479e-a5cd-bf46c0813f8b	2026-02-28 15:01:30.991+00	2026-02-28 15:01:30.991+00	80.00
b50627a9-c298-4f54-a47e-037a683b45ba	t	2026-02-28	60f04dee-7737-4067-a2f2-2f3a328f111b	2026-02-28 15:01:30.991+00	2026-02-28 15:01:30.991+00	130.00
d26ff03c-9c67-4287-88ca-3c1f5053c289	t	2026-02-28	2435280f-a345-4e5b-a24a-9a7892441503	2026-02-28 15:01:30.991+00	2026-02-28 15:01:30.991+00	100.00
61e1b284-3121-46d8-a7d2-dad38618b1f5	t	2026-02-28	691ba036-1b9f-420e-9c6e-0c110b949ab9	2026-02-28 15:01:30.991+00	2026-02-28 15:01:30.991+00	170.00
e5fc788c-4b10-41cb-a382-d3a07ae32f97	f	2026-03-05	7daeda27-5ac6-40cf-9967-930e46125e3f	2026-02-28 13:24:24.523+00	2026-02-28 15:06:16.114+00	163.00
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipes (id, description, amount, "createdAt") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: installments installments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installments
    ADD CONSTRAINT installments_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: installments installments_expenses_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.installments
    ADD CONSTRAINT installments_expenses_id_fkey FOREIGN KEY (expenses_id) REFERENCES public.expenses(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict uDfIa9ldOsmkrWITAcj8fXWObNqAHqk7Ek5CD6c3ziefghKwosGqTg2GwzKczZB

