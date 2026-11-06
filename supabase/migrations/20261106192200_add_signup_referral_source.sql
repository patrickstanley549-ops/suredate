alter table public.user_private
  add column if not exists heard_about_us text,
  add column if not exists heard_about_us_other text;

alter table public.user_private
  add constraint user_private_heard_about_us_allowed
    check (heard_about_us is null or heard_about_us in (
      'google_search', 'google_ads', 'bing', 'yahoo', 'duckduckgo',
      'facebook', 'instagram', 'tiktok', 'youtube', 'x_twitter', 'snapchat',
      'pinterest', 'linkedin', 'reddit', 'threads', 'whatsapp', 'telegram',
      'discord', 'twitch', 'quora', 'bluesky', 'friend_family',
      'influencer_creator', 'blog_article', 'podcast', 'online_ad',
      'dating_community', 'news_media', 'app_store', 'event_meetup',
      'other', 'not_sure'
    )),
  add constraint user_private_heard_about_us_other_length
    check (heard_about_us_other is null or char_length(heard_about_us_other) <= 120);

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
  v_heard_about_us text;
  v_heard_about_us_other text;
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
  v_heard_about_us := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'heard_about_us'), '');
  v_heard_about_us_other := nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'heard_about_us_other'), '');

  if v_dob_text is null or v_dob_text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
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

  if v_heard_about_us is not null and v_heard_about_us not in (
    'google_search', 'google_ads', 'bing', 'yahoo', 'duckduckgo',
    'facebook', 'instagram', 'tiktok', 'youtube', 'x_twitter', 'snapchat',
    'pinterest', 'linkedin', 'reddit', 'threads', 'whatsapp', 'telegram',
    'discord', 'twitch', 'quora', 'bluesky', 'friend_family',
    'influencer_creator', 'blog_article', 'podcast', 'online_ad',
    'dating_community', 'news_media', 'app_store', 'event_meetup',
    'other', 'not_sure'
  ) then
    raise exception 'Select a valid answer for how you heard about SureDate.';
  end if;
  if v_heard_about_us_other is not null and pg_catalog.char_length(v_heard_about_us_other) > 120 then
    raise exception 'The referral source detail must be 120 characters or fewer.';
  end if;
  if v_heard_about_us is distinct from 'other' then
    v_heard_about_us_other := null;
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
    religion, height_cm, weight_kg, clothing_size, heard_about_us,
    heard_about_us_other
  )
  values (
    new.id, v_dob, pg_catalog.now(), v_country, v_race_ethnicity,
    v_religion, v_height, v_weight, v_clothing_size, v_heard_about_us,
    v_heard_about_us_other
  );

  insert into public.profiles (id, display_name, gender, bio)
  values (new.id, v_display_name, v_gender, '');

  return new;
end;
$function$;
