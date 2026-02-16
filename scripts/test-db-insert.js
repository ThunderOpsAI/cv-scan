
const { createClient } = require('@supabase/supabase-js');

async function testInsert() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing env vars");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get a user
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);

    if (userError || !users || users.length === 0) {
        console.error("Failed to fetch user:", userError);
        return;
    }

    const user = users[0];
    console.log("Found user:", user.email);

    // 2. Try insert
    const { data, error } = await supabase
        .from('generations')
        .insert({
            user_id: user.id,
            type: 'cover_letter',
            input: { resume: 'test resume', job_description: 'test jd' },
            output: 'test output',
            credits_used: 1
        })
        .select();

    if (error) {
        console.error("Insert failed:", error);
    } else {
        console.log("Insert successful:", data);
    }
}

testInsert();
