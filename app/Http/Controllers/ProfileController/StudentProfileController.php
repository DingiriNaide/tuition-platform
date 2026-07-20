public function store(Request $request)
{
    $validated = $request->validate([
        'full_name'     => 'required|string|max:255',
        'date_of_birth' => 'nullable|date',
        'gender'        => 'nullable|in:male,female,other',
        'phone'         => 'nullable|string|max:20',
        'school'        => 'nullable|string|max:255',
        'grade'         => 'nullable|in:grade_6,grade_7,grade_8,grade_9,grade_10,grade_11,al_1,al_2,al_3,foundation',
        'medium'        => 'required|in:sinhala,tamil,english',
        'district'      => 'nullable|string|max:100',
        'city'          => 'nullable|string|max:100',
        'is_low_income' => 'boolean',
        'avatar'        => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    unset($validated['avatar']);

    $profile = $request->user()->studentProfile()->create($validated);
    $request->user()->assignRole('student');

    if ($request->hasFile('avatar')) {
        $profile->addMediaFromRequest('avatar')->toMediaCollection('avatar');
    }

    return redirect()->route('student.profile.show')
        ->with('success', 'Profile created successfully.');
}

public function update(Request $request)
{
    $validated = $request->validate([
        'full_name'     => 'required|string|max:255',
        'date_of_birth' => 'nullable|date',
        'gender'        => 'nullable|in:male,female,other',
        'phone'         => 'nullable|string|max:20',
        'school'        => 'nullable|string|max:255',
        'grade'         => 'nullable|in:grade_6,grade_7,grade_8,grade_9,grade_10,grade_11,al_1,al_2,al_3,foundation',
        'medium'        => 'required|in:sinhala,tamil,english',
        'district'      => 'nullable|string|max:100',
        'city'          => 'nullable|string|max:100',
        'is_low_income' => 'boolean',
        'avatar'        => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    unset($validated['avatar']);

    $profile = $request->user()->studentProfile;
    $profile->update($validated);

    if ($request->hasFile('avatar')) {
        $profile->addMediaFromRequest('avatar')->toMediaCollection('avatar');
    }

    return redirect()->route('student.profile.show')
        ->with('success', 'Profile updated successfully.');
}