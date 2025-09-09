<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Prihvata multipart/form-data sa poljem 'file' i čuva ga na public disku.
     */
    public function storeSimple(Request $request)
    {
        // Korak 1: Validacija (i dalje veoma važna!)
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120', // max:5120 je 5MB
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Korak 2: Obrada fajla
        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        
        // Čuvanje fajla na 'public' disku unutar 'uploads' direktorijuma
        $path = $file->storeAs('uploads', $fileName, 'public');

        // Korak 3: Vraćanje uspešnog odgovora sa putanjom do fajla
        // Umesto kreiranja modela, vraćamo direktne informacije o fajlu.
        return response()->json([
            'message' => 'File uploaded successfully.',
            'data' => [
                'original_name' => $file->getClientOriginalName(),
                'stored_name'   => $fileName,
                'path'          => $path,
                'url'           => Storage::url($path) // Generiše javno dostupan URL
            ]
        ], 200); // 200 OK je prikladniji status jer ništa novo nije kreirano u bazi
    }
}