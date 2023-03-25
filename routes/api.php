<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

//Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//    return $request->user();
//});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::apiResource('surveys', \App\Http\Controllers\Api\SurveyController::class);
    Route::get('/dashboard', [\App\Http\Controllers\Api\DashboardController::class, 'index']);
});

//Route::get('/surveys/get-by-slug/slug', function () {
//    return response()->json(['gghghg' => 'hhhhhhhhhhhh'], 200);
//});
Route::get('/surveys/get-by-slug/{survey:slug}', [\App\Http\Controllers\Api\SurveyController::class, 'getBySlug']);
Route::post('/surveys/{survey}/answer', [\App\Http\Controllers\Api\SurveyController::class, 'storeAnswer']);

Route::post('/signup', [\App\Http\Controllers\Api\AuthController::class, 'signup']);
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
