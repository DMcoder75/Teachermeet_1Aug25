import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zcoyhczoajqkqwksmlet.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjb3loY3pvYWpxa3F3a3NtbGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDk3NDIsImV4cCI6MjA2OTU4NTc0Mn0.1fS7Z-5E5cValnk1Glb_J8HJ-buSrjX53VJ2lY5ZO6E';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const users = [
  { email: 'sarah.johnson@stanford.edu', password: 'password123' },
  { email: 'm.thompson@lincolnhigh.edu', password: 'password123' },
  { email: 'jennifer.davis@oakwoodelem.edu', password: 'password123' },
  { email: 'r.williams@mit.edu', password: 'password123' },
  { email: 'l.anderson@riverside.edu', password: 'password123' },
  { email: 'james.miller@harvard.edu', password: 'password123' },
  { email: 'a.wilson@westfield.edu', password: 'password123' },
  { email: 'd.brown@cityschools.edu', password: 'password123' },
  { email: 'priya.sharma@iitdelhi.ac.in', password: 'password123' },
  { email: 'rajesh.kumar@dpsschool.edu.in', password: 'password123' },
  { email: 'anita.patel@brightfuture.edu.in', password: 'password123' },
  { email: 'v.singh@aiims.edu.in', password: 'password123' },
  { email: 'meera.gupta@kendriya.edu.in', password: 'password123' },
  { email: 'arjun.reddy@iisc.ac.in', password: 'password123' },
  { email: 'emma.thompson@sydney.edu.au', password: 'password123' },
  { email: 'm.oconnor@melbourne.edu.au', password: 'password123' },
  { email: 'sophie.clarke@sunshine.edu.au', password: 'password123' },
  { email: 'a.mitchell@unsw.edu.au', password: 'password123' },
  { email: 'catherine.smith@oxford.ac.uk', password: 'password123' },
  { email: 'w.jones@eton.ac.uk', password: 'password123' },
  { email: 'rachel.green@stmarys.sch.uk', password: 'password123' },
  { email: 't.wilson@cambridge.ac.uk', password: 'password123' },
  { email: 'hans.mueller@tum.de', password: 'password123' },
  { email: 'i.schmidt@gymnasium-berlin.de', password: 'password123' },
  { email: 'k.weber@charite.de', password: 'password123' },
  { email: 'li.wei@nus.edu.sg', password: 'password123' },
  { email: 'siti.rahman@raffles.edu.sg', password: 'password123' },
  { email: 'siobhan.obrien@tcd.ie', password: 'password123' },
  { email: 'p.murphy@stpatricks.ie', password: 'password123' },
  { email: 'fiona.kelly@ucd.ie', password: 'password123' },
];

async function registerUsers() {
  for (const user of users) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (error) {
      console.error(`Error registering ${user.email}:`, error.message);
    } else if (data.user) {
      console.log(`Successfully registered ${user.email}. User ID: ${data.user.id}`);
    } else {
      console.log(`User ${user.email} already exists or needs email confirmation.`);
    }
  }
}

registerUsers();


