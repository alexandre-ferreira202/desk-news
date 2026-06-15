import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zxopxmcwoakdvxwvmufy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b3B4bWN3b2FrZHZ4d3ZtdWZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMzNjkwNiwiZXhwIjoyMDkzOTEyOTA2fQ.z2svm-fTD1QYP5CsZ3TDBwEvA9G3AQwNqv_KlXHVI20'
);

const users = [
  { email: 'admin@tv.com',                    password: 'admin1234' },
  { email: 'admin@teste.com',                 password: 'Senh@123456' },
  { email: 'desknewstvufma@gmail.com',        password: 'desknews@2026' },
  { email: 'alex.ferreira.manoel@gmail.com',  password: 'Carro@2023' },
];

for (const u of users) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
  });

  if (error) {
    console.error(`❌ ${u.email}:`, error.message);
  } else {
    console.log(`✅ ${u.email} criado — id: ${data.user.id}`);
  }
}
