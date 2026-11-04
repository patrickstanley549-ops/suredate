alter table public.user_private
  add column if not exists country text,
  add column if not exists race_ethnicity text,
  add column if not exists religion text,
  add column if not exists height_cm smallint,
  add column if not exists weight_kg numeric(5,2),
  add column if not exists clothing_size text;

alter table public.user_private
  add constraint user_private_country_length
    check (country is null or char_length(country) <= 100),
  add constraint user_private_race_ethnicity_length
    check (race_ethnicity is null or char_length(race_ethnicity) <= 80),
  add constraint user_private_religion_length
    check (religion is null or char_length(religion) <= 80),
  add constraint user_private_height_range
    check (height_cm is null or height_cm between 80 and 250),
  add constraint user_private_weight_range
    check (weight_kg is null or weight_kg between 20 and 500),
  add constraint user_private_clothing_size_length
    check (clothing_size is null or char_length(clothing_size) <= 30);

create or replace function app_private.create_private_user_on_auth_signup()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_dob_text text;
  v_dob date;
  v_display_name text;
  v_gender text;
  v_country text;
  v_race_ethnicity text;
  v_religion text;
  v_height_text text;
  v_weight_text text;
  v_clothing_size text;
  v_height smallint;
  v_weight numeric(5,2);
begin
  v_dob_text := new.raw_user_meta_data ->> 'date_of_birth';
  v_display_name := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'display_name'), '');
  v_gender := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'gender'), '');
  v_country := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'country'), '');
  v_race_ethnicity := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'race_ethnicity'), '');
  v_religion := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'religion'), '');
  v_height_text := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'height_cm'), '');
  v_weight_text := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'weight_kg'), '');
  v_clothing_size := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'clothing_size'), '');

  if v_dob_text is null or v_dob_text !~ '^\d{4}-\d{2}-\d{2}$' then
    raise exception 'Date of birth is required in YYYY-MM-DD format to create an account.';
  end if;

  begin
    v_dob := v_dob_text::date;
  exception when others then
    raise exception 'Date of birth must be a valid calendar date.';
  end;

  if v_dob > (current_date - pg_catalog.make_interval(years => 18)) then
    raise exception 'You must be at least 18 years old to use this app.';
  end if;

  if v_display_name is null or pg_catalog.char_length(v_display_name) > 40 then
    raise exception 'Enter a display name of up to 40 characters.';
  end if;
  if v_gender is null or pg_catalog.char_length(v_gender) > 40 then
    raise exception 'Select a gender to create your profile.';
  end if;

  if v_country is not null and pg_catalog.char_length(v_country) > 100 then
    raise exception 'Country must be 100 characters or fewer.';
  end if;
  if v_race_ethnicity is not null and pg_catalog.char_length(v_race_ethnicity) > 80 then
    raise exception 'Race or ethnicity must be 80 characters or fewer.';
  end if;
  if v_religion is not null and pg_catalog.char_length(v_religion) > 80 then
    raise exception 'Religion must be 80 characters or fewer.';
  end if;
  if v_clothing_size is not null and pg_catalog.char_length(v_clothing_size) > 30 then
    raise exception 'Clothing size must be 30 characters or fewer.';
  end if;

  begin
    if v_height_text is not null then v_height := v_height_text::smallint; end if;
    if v_weight_text is not null then v_weight := v_weight_text::numeric(5,2); end if;
  exception when others then
    raise exception 'Height and weight must be valid numbers.';
  end;

  if v_height is not null and v_height not between 80 and 250 then
    raise exception 'Height must be between 80 and 250 cm.';
  end if;
  if v_weight is not null and v_weight not between 20 and 500 then
    raise exception 'Weight must be between 20 and 500 kg.';
  end if;

  insert into public.user_private (
    user_id, date_of_birth, age_verified_at, country, race_ethnicity,
    religion, height_cm, weight_kg, clothing_size
  )
  values (
    new.id, v_dob, pg_catalog.now(), v_country, v_race_ethnicity,
    v_religion, v_height, v_weight, v_clothing_size
  );

  insert into public.profiles (id, display_name, gender, bio)
  values (new.id, v_display_name, v_gender, '');

  return new;
end;
$function$;
