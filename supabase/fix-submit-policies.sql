drop policy if exists "Public can insert pending reviews" on reviews;
drop policy if exists "Anyone can submit pending reviews" on reviews;
create policy "Anyone can submit pending reviews"
on reviews
for insert
to anon, authenticated
with check (status = 'pending');

drop policy if exists "Public can insert pending resources" on resources;
drop policy if exists "Anyone can submit pending resources" on resources;
create policy "Anyone can submit pending resources"
on resources
for insert
to anon, authenticated
with check (status = 'pending');
