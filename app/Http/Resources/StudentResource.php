<?php

namespace App\Http\Resources;

use App\Services\StudentService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var \App\Services\StudentService $service */
        $service = app(StudentService::class);
        
        $isDetail = $request->routeIs('students.show', 'students.edit');

        return [
            'id' => $this->id,
            'student_number' => $this->student_number,
            'full_name' => $this->full_name,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'grade_level' => $this->gradeLevel->name ?? '—',
            'section' => $this->section->name ?? '—',
            'grade_level_id' => $this->grade_level_id,
            'section_id' => $this->section_id,
            'status' => $this->status,
            'total_paid' => (float) $this->total_paid,
            'expected_fees' => (float) $service->calculateExpectedFees($this->resource),
            'balance' => (float) $service->calculateBalance($this->resource),
            'payment_status' => $service->getPaymentStatus($this->resource),
            'created_at' => $this->created_at,
            
            $this->mergeWhen($isDetail, [
                'contact_number' => $this->contact_number,
                'email' => $this->email,
                'parent_name' => $this->parent_name,
                'parent_contact' => $this->parent_contact,
                'parent_email' => $this->parent_email,
                'notes' => $this->notes,
            ]),
        ];
    }
}
