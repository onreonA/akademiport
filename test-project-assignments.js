// Test script for project assignment tables
// Run with: node test-project-assignments.js

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://frylotuwbjhqybcxvvzs.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProjectAssignments() {
  console.log('🧪 Testing Project Assignment Tables...\n');

  try {
    // Test 1: Check if new tables exist
    console.log('1️⃣ Checking if new tables exist...');

    const { data: projectAssignments, error: paError } = await supabase
      .from('project_assignments')
      .select('count')
      .limit(1);

    if (paError) {
      console.log('❌ project_assignments table not found:', paError.message);
      return;
    }
    console.log('✅ project_assignments table exists');

    const { data: subProjectAssignments, error: spaError } = await supabase
      .from('sub_project_assignments')
      .select('count')
      .limit(1);

    if (spaError) {
      console.log(
        '❌ sub_project_assignments table not found:',
        spaError.message
      );
      return;
    }
    console.log('✅ sub_project_assignments table exists');

    const { data: companyProjectProgress, error: cppError } = await supabase
      .from('company_project_progress')
      .select('count')
      .limit(1);

    if (cppError) {
      console.log(
        '❌ company_project_progress table not found:',
        cppError.message
      );
      return;
    }
    console.log('✅ company_project_progress table exists');

    const { data: companySubProjectProgress, error: csppError } = await supabase
      .from('company_sub_project_progress')
      .select('count')
      .limit(1);

    if (csppError) {
      console.log(
        '❌ company_sub_project_progress table not found:',
        csppError.message
      );
      return;
    }
    console.log('✅ company_sub_project_progress table exists\n');

    // Test 2: Check migrated data
    console.log('2️⃣ Checking migrated data...');

    const { data: assignments, error: assignmentsError } = await supabase
      .from('project_assignments')
      .select(
        `
        id,
        project_id,
        company_id,
        status,
        assigned_at,
        projects (
          id,
          title,
          description
        ),
        companies (
          id,
          name,
          email
        )
      `
      )
      .limit(5);

    if (assignmentsError) {
      console.log(
        '❌ Error fetching project assignments:',
        assignmentsError.message
      );
      return;
    }

    console.log(`✅ Found ${assignments.length} project assignments:`);
    assignments.forEach((assignment, index) => {
      console.log(
        `   ${index + 1}. Project: ${assignment.projects?.title} -> Company: ${assignment.companies?.name}`
      );
    });

    // Test 3: Check progress records
    console.log('\n3️⃣ Checking progress records...');

    const { data: progress, error: progressError } = await supabase
      .from('company_project_progress')
      .select(
        `
        id,
        project_id,
        company_id,
        progress_percentage,
        completed_tasks,
        total_tasks,
        projects (
          title
        ),
        companies (
          name
        )
      `
      )
      .limit(5);

    if (progressError) {
      console.log('❌ Error fetching progress records:', progressError.message);
      return;
    }

    console.log(`✅ Found ${progress.length} progress records:`);
    progress.forEach((record, index) => {
      console.log(
        `   ${index + 1}. ${record.companies?.name} on ${record.projects?.title}: ${record.progress_percentage}% (${record.completed_tasks}/${record.total_tasks} tasks)`
      );
    });

    // Test 4: Check sub-project assignments
    console.log('\n4️⃣ Checking sub-project assignments...');

    const { data: subAssignments, error: subAssignmentsError } = await supabase
      .from('sub_project_assignments')
      .select(
        `
        id,
        sub_project_id,
        company_id,
        status,
        sub_projects (
          id,
          title,
          project_id,
          projects (
            title
          )
        ),
        companies (
          name
        )
      `
      )
      .limit(5);

    if (subAssignmentsError) {
      console.log(
        '❌ Error fetching sub-project assignments:',
        subAssignmentsError.message
      );
      return;
    }

    console.log(`✅ Found ${subAssignments.length} sub-project assignments:`);
    subAssignments.forEach((assignment, index) => {
      console.log(
        `   ${index + 1}. Sub-project: ${assignment.sub_projects?.title} (${assignment.sub_projects?.projects?.title}) -> Company: ${assignment.companies?.name}`
      );
    });

    // Test 5: Test data integrity
    console.log('\n5️⃣ Testing data integrity...');

    // Check if all projects with company_id have corresponding assignments
    const { data: projectsWithCompany, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, company_id')
      .not('company_id', 'is', null);

    if (projectsError) {
      console.log('❌ Error fetching projects:', projectsError.message);
      return;
    }

    const { data: allAssignments, error: allAssignmentsError } = await supabase
      .from('project_assignments')
      .select('project_id, company_id');

    if (allAssignmentsError) {
      console.log(
        '❌ Error fetching all assignments:',
        allAssignmentsError.message
      );
      return;
    }

    const assignmentMap = new Map();
    allAssignments.forEach(assignment => {
      assignmentMap.set(
        `${assignment.project_id}-${assignment.company_id}`,
        true
      );
    });

    let missingAssignments = 0;
    projectsWithCompany.forEach(project => {
      const key = `${project.id}-${project.company_id}`;
      if (!assignmentMap.has(key)) {
        missingAssignments++;
        console.log(
          `   ⚠️  Missing assignment: Project ${project.title} -> Company ${project.company_id}`
        );
      }
    });

    if (missingAssignments === 0) {
      console.log(
        '✅ All projects with company_id have corresponding assignments'
      );
    } else {
      console.log(`❌ Found ${missingAssignments} missing assignments`);
    }

    console.log('\n🎉 Database migration test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Project assignments: ${assignments.length}`);
    console.log(`   - Progress records: ${progress.length}`);
    console.log(`   - Sub-project assignments: ${subAssignments.length}`);
    console.log(`   - Projects with company_id: ${projectsWithCompany.length}`);
    console.log(`   - Missing assignments: ${missingAssignments}`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProjectAssignments();
