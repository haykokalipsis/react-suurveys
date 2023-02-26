<?php

namespace App\Http\Controllers\Api;

use App\Enums\QuestionTypeEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\AnswerStoreRequest;
use App\Http\Requests\SurveyStoreRequest;
use App\Http\Requests\SurveyUpdateRequest;
use App\Http\Resources\SurveyResource;
use App\Models\Answer;
use App\Models\Question;
use App\Models\QuestionAnswer;
use App\Models\Survey;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Enum;

class SurveyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection|\Illuminate\Http\Response
     */
    public function index()
    {
        $user = auth()->user();
        $surveys = Survey::where('user_id', $user->id)->orderBy('created_at', 'desc')->paginate(2);
        return SurveyResource::collection($surveys);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return SurveyResource|\Illuminate\Http\Response
     */
    public function store(SurveyStoreRequest $request)
    {
        $data = $request->validated();

        if (isset($data['image'])) {
            $relativePath = $this->saveImage($data['image']);
            $data['image'] = $relativePath;
        }

//        $user = $request->user();
        $survey = Survey::create($data);

        foreach ($data['questions'] as $question) {
            $question['survey_id'] = $survey->id;
            $this->createQuestion($question);
        }

        return new SurveyResource($survey);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return SurveyResource|\Illuminate\Http\Response
     */
    public function show(Survey $survey, Request $request)
    {
        $user = $request->user();
        if ($user->id !== $survey->user_id) {
            return abort(403, 'Unauthorized action');
        }
        return new SurveyResource($survey);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return SurveyResource|\Illuminate\Http\Response
     */
    public function update(SurveyUpdateRequest $request, Survey $survey)
    {
        $data = $request->validated();

        // Check if image was given and save on local file system
        if (isset($data['image'])) {
            $relativePath = $this->saveImage($data['image']);
            $data['image'] = $relativePath;

            if ($survey->image) {
                $absolutePath = public_path($survey->image);
                File::delete($absolutePath);
            }
        }

        $survey->update($data);
        // Get ids as plain array of existing questions (in db)
        $existingIds = $survey->questions()->pluck('id')->toArray();
        // Get ids as plain array of new questions (from request)
        $newIds = Arr::pluck($data['questions'], 'id');
        // Find questions to delete (if there are some ids in $existingIds but not in $newIds, those will be in $toDeleteIds) (basically something like sync method in many to manies)
        $toDeleteIds = array_diff($existingIds, $newIds);
        // Find questions to add
        $toAddIds = array_diff($newIds, $existingIds);

        // Delete questions by $toDeleteIds array
        Survey::destroy($toDeleteIds);

        // Create new questions
        foreach ($data['questions'] as $question) {
            if (in_array($question['id'], $toAddIds)) {
                $question['survey_id'] = $survey->id;
                $this->createQuestion($question);
            }
        }

        // Update existing questions.
        $questionMap = collect($data['questions'])->keyBy('id'); // Assoc array where key is question id
        foreach ($survey->questions as $question) {
            if (isset($questionMap[$question->id])) {
                $this->updateQuestion($question, $questionMap[$question->id]);
            }
        }

        return new SurveyResource($survey);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Survey $survey)
    {
        if (auth()->id() !== $survey->user_id) {
            return abort(403, 'Unauthorized action.');
        }

        if ($survey->image) {
            $absolutePath = public_path($survey->image);
            File::delete($absolutePath);
        }

        $survey->delete();

        return response('', 204);
    }

    private function saveImage($image)
    {
        // Check if image is valid base64 string
        if (preg_match('~^data:image\/(\w+);base64,~', $image, $type))
        {
//                               '/^data:image\/(\w+);base64,/'
            // Take out the base64 encoded text without mime type
            $image = substr($image, strpos($image, ',') + 1);

            // Get file extension
            $type = strtolower($type[1]); // jpg, png, gif

            // Check if file type is an image
            if ( ! in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                throw new \Exception('invalid image type');
            }

            $image = str_replace(' ', '+', $image);
            $image = base64_decode($image);

            if ($image === false) {
                throw new \Exception('base64_decode failed');
            }
        }
        else
        {
            throw new \Exception('did not match data URI with image data');
        }

        $dir = 'images/';
        $file = Str::random() . '.' . $type;
        $absolutePath = public_path($dir);
        $relativePath = $dir . $file;
        if ( ! File::exists($absolutePath)) {
            File::makeDirectory($absolutePath, 0755, true);
        }
        file_put_contents($relativePath, $image);

        return $relativePath;
    }

    private function createQuestion($data)
    {
        if (is_array($data['data'])) {
            $data['data'] = json_encode($data['data']);
        }

        $validator = Validator::make($data, [
            'title' => 'required|string',
            'type' => ['required', new Enum(QuestionTypeEnum::class)],
            'description' => 'nullable|string',
            'data' => 'present',
            'survey_id' => 'exists:App\Models\Survey,id'
        ]);

        return Question::create($validator->validated());
    }

    private function updateQuestion(Question $question, $data)
    {
        // If this is select, checkbox, radio etc
        if (is_array($data['data'])) {
            $data['data'] = json_encode($data['data']);
        }
        $validator = Validator::make($data, [
            'id' => 'exists:App\Models\Question,id',
            'title' => 'required|string',
            'type' => ['required', new Enum(QuestionTypeEnum::class)],
            'description' => 'nullable|string',
            'data' => 'present'
        ]);

        return $question->update($validator->validated());
    }

    public function getBySlug(Survey $survey)
    {
        if (!$survey->status) {
            return response("", 404);
        }

        $currentDate = new \DateTime();
        $expireDate = new \DateTime($survey->expire_date);
        if ($currentDate > $expireDate) {
            return response("", 404);
        }

        return new SurveyResource($survey);
    }

    public function storeAnswer(AnswerStoreRequest $request, Survey $survey)
    {
        $validated = $request->validated();

        $surveyAnswer = Answer::create([
            'survey_id' => $survey->id,
            'start_date' => date('Y-m-d H:i:s'),
            'end_date' => date('Y-m-d H:i:s'),
        ]);

        foreach ($validated['answers'] as $questionId => $answer) {
            $question = Question::where(['id' => $questionId, 'survey_id' => $survey->id])->get();
            if (!$question) {
                return response("Invalid question ID: \"$questionId\"", 400);
            }

            $data = [
                'question_id' => $questionId,
                'answer_id' => $surveyAnswer->id,
                'answer' => is_array($answer) ? json_encode($answer) : $answer
            ];

            $questionAnswer = QuestionAnswer::create($data);
        }

        return response("", 201);
    }
}
