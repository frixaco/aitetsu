use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

// ======================================================================
// ==                                                                  ==
// ==                             REQUEST                              ==
// ==                                                                  ==
// ======================================================================

/// Represents a specific format for the model's output.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResponseFormat {
    /// The type of response format. For example, `json_object` to enable JSON mode.
    #[serde(rename = "type")]
    pub format_type: String,
}

/// A specific tool function to be called by the model.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ToolChoiceFunction {
    /// The name of the function to be called.
    pub name: String,
}

/// An object specifying a particular tool to be called.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct ToolChoiceObject {
    /// The type of the tool. Currently, only "function" is supported.
    #[serde(rename = "type")]
    pub tool_type: String,
    /// The specific function to be called.
    pub function: ToolChoiceFunction,
}

/// Controls which (if any) tool is called by the model.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum ToolChoice {
    /// A string option: "none", "auto", or "required".
    String(String),
    /// An object forcing the model to call a specific tool.
    Object(ToolChoiceObject),
}

/// Represents the parameters for an OpenRouter API request.
///
/// This struct covers all documented sampling and request parameters.
/// Optional fields are represented by `Option<T>` and will be omitted
/// from the serialized JSON if they are `None`.
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
#[non_exhaustive]
pub struct RequestParameters {
    /// Influences the variety in the model's responses. Lower values lead to more
    /// predictable responses, while higher values encourage more diversity.
    /// At 0, the model is deterministic.
    ///
    /// Optional, float, 0.0 to 2.0. Defaults to 1.0.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,

    /// Limits the model's choices to a percentage of likely tokens. A lower
    /// value makes responses more predictable.
    ///
    /// Optional, float, 0.0 to 1.0. Defaults to 1.0.
    #[serde(rename = "top_p", skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,

    /// Limits the model's choice of tokens to the K most likely ones. A value of
    /// 1 means the model always picks the most likely token.
    ///
    /// Optional, integer, 0 or above. Defaults to 0 (disabled).
    #[serde(rename = "top_k", skip_serializing_if = "Option::is_none")]
    pub top_k: Option<u32>,

    /// Controls token repetition based on frequency in the input. Higher values
    /// discourage using frequent tokens. Negative values encourage their reuse.
    ///
    /// Optional, float, -2.0 to 2.0. Defaults to 0.0.
    #[serde(rename = "frequency_penalty", skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>,

    /// Adjusts the likelihood of repeating tokens already present in the input.
    /// Higher values make repetition less likely.
    ///
    /// Optional, float, -2.0 to 2.0. Defaults to 0.0.
    #[serde(rename = "presence_penalty", skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>,

    /// Helps reduce token repetition. A higher value makes the model less likely
    /// to repeat tokens, but can harm coherence if too high.
    ///
    /// Optional, float, 0.0 to 2.0. Defaults to 1.0.
    #[serde(rename = "repetition_penalty", skip_serializing_if = "Option::is_none")]
    pub repetition_penalty: Option<f32>,

    /// The minimum probability for a token to be considered, relative to the
    /// probability of the most likely token.
    ///
    /// Optional, float, 0.0 to 1.0. Defaults to 0.0.
    #[serde(rename = "min_p", skip_serializing_if = "Option::is_none")]
    pub min_p: Option<f32>,

    /// Considers only tokens with probabilities high enough relative to the most
    /// likely token's probability.
    ///
    /// Optional, float, 0.0 to 1.0. Defaults to 0.0.
    #[serde(rename = "top_a", skip_serializing_if = "Option::is_none")]
    pub top_a: Option<f32>,

    /// If specified, sampling will be deterministic. Repeated requests with the
    /// same seed and parameters should return the same result.
    ///
    /// Optional, integer.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i64>,

    /// The maximum number of tokens to generate. The maximum value is the
    /// context length minus the prompt length.
    ///
    /// Optional, integer, 1 or above.
    #[serde(rename = "max_tokens", skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,

    /// A map of token IDs to bias values (-100 to 100). The bias is added
    /// to the logits before sampling to increase or decrease the likelihood of
    /// specific tokens.
    ///
    /// Optional, map of token ID (integer) to bias (float).
    #[serde(rename = "logit_bias", skip_serializing_if = "Option::is_none")]
    pub logit_bias: Option<HashMap<u32, f32>>,

    /// Whether to return log probabilities of the output tokens.
    ///
    /// Optional, boolean.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub logprobs: Option<bool>,

    /// The number of most likely tokens to return at each position, each with an
    /// associated log probability. `logprobs` must be true.
    ///
    /// Optional, integer, 0 to 20.
    #[serde(rename = "top_logprobs", skip_serializing_if = "Option::is_none")]
    pub top_logprobs: Option<u8>,

    /// Forces the model to produce a specific output format. For example,
    /// setting to `{ "type": "json_object" }` enables JSON mode.
    ///
    /// Optional, map.
    #[serde(rename = "response_format", skip_serializing_if = "Option::is_none")]
    pub response_format: Option<ResponseFormat>,

    /// If the model can return structured outputs using response_format json_schema.
    ///
    /// Optional, boolean.
    #[serde(rename = "structured_outputs", skip_serializing_if = "Option::is_none")]
    pub structured_outputs: Option<bool>,

    /// An array of strings that will cause the generation to stop immediately
    /// if any of them are encountered.
    ///
    /// Optional, array of strings.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stop: Option<Vec<String>>,

    /// A list of tools the model may call, following OpenAI's tool calling format.
    /// Represented as a flexible JSON value.
    ///
    /// Optional, array.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<Value>>,

    /// Controls which tool is called by the model. Can be "none", "auto",
    /// "required", or an object specifying a function to call.
    ///
    /// Optional.
    #[serde(rename = "tool_choice", skip_serializing_if = "Option::is_none")]
    pub tool_choice: Option<ToolChoice>,
}

// ======================================================================
// ==                                                                  ==
// ==                            RESPONSE                              ==
// ==                                                                  ==
// ======================================================================

/// Represents the overall response from the Chat Completions API.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[non_exhaustive]
pub struct ChatCompletionResponse {
    /// A unique identifier for the completion generation.
    pub id: String,

    /// A list of choices generated by the model. The structure of each choice
    /// depends on whether the request was streaming or non-streaming.
    pub choices: Vec<Choice>,

    /// The Unix timestamp (in seconds) of when the completion was created.
    pub created: i64,

    /// The model that was used for the completion.
    pub model: String,

    /// The object type, which is always `chat.completion` for non-streaming
    /// responses and `chat.completion.chunk` for streaming responses.
    pub object: CompletionObject,

    /// A system-provided fingerprint that specifies the backend configuration used
    /// for this completion. Only present if the provider supports it.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system_fingerprint: Option<String>,

    /// Usage statistics for the completion request. Always present for non-streaming
    /// responses. For streaming responses, it is sent in the final chunk.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub usage: Option<ResponseUsage>,
}

/// The type of the response object.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum CompletionObject {
    #[serde(rename = "chat.completion")]
    ChatCompletion,
    #[serde(rename = "chat.completion.chunk")]
    ChatCompletionChunk,
}

/// A choice in the completion response. This can be one of several types,
/// depending on the request parameters (`stream`, `prompt` vs `messages`).
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(untagged)]
pub enum Choice {
    /// A choice for a non-streaming chat completion.
    NonStreaming(NonStreamingChoice),
    /// A choice chunk for a streaming chat completion.
    Streaming(StreamingChoice),
    /// A choice for a legacy prompt-based completion (non-chat).
    NonChat(NonChatChoice),
}

/// Usage statistics for the completion, using a normalized token count.
///
/// Note: Credit usage is based on the native token counts, which can be
/// retrieved from the `/api/v1/generation` endpoint.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ResponseUsage {
    /// The number of tokens in the prompt, including images and tools if any.
    pub prompt_tokens: u32,
    /// The number of tokens in the generated completion.
    pub completion_tokens: u32,
    /// The total number of tokens used in the request (prompt + completion).
    pub total_tokens: u32,
}

/// A choice for a legacy prompt-based completion.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonChatChoice {
    /// The reason the model stopped generating tokens. Can be `stop`, `length`, etc.
    pub finish_reason: Option<String>,
    /// The generated text.
    pub text: String,
    /// An error object, if an error occurred for this specific choice.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ErrorResponse>,
}

/// A choice for a standard, non-streaming chat completion.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct NonStreamingChoice {
    /// The normalized reason the model stopped generating tokens. One of:
    /// `tool_calls`, `stop`, `length`, `content_filter`, `error`.
    pub finish_reason: Option<String>,
    /// The raw finish reason string from the provider.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub native_finish_reason: Option<String>,
    /// The message generated by the model.
    pub message: ResponseMessage,
    /// An error object, if an error occurred for this specific choice.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ErrorResponse>,
}

/// A choice chunk from a streaming chat completion.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct StreamingChoice {
    /// The normalized reason the model stopped generating tokens.
    pub finish_reason: Option<String>,
    /// The raw finish reason string from the provider.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub native_finish_reason: Option<String>,
    /// A delta containing the content fragment.
    pub delta: Delta,
    /// An error object, if an error occurred for this specific choice.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<ErrorResponse>,
}

/// The message object returned in a non-streaming response.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ResponseMessage {
    /// The content of the message, which can be null.
    pub content: Option<String>,
    /// The role of the author of this message (e.g., "assistant").
    pub role: String,
    /// The tool calls generated by the model, if any.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tool_calls: Option<Vec<ToolCall>>,
}

/// The delta object returned in a streaming response chunk.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Delta {
    /// A content fragment.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub content: Option<String>,
    /// The role of the author. Usually only present in the first chunk.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    /// A list of tool calls, which may be delivered in fragments across chunks.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub tool_calls: Option<Vec<ToolCall>>,
}

/// A tool call requested by the model.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ToolCall {
    /// The ID of the tool call.
    pub id: String,
    /// The type of the tool. Currently, only "function" is supported.
    #[serde(rename = "type")]
    pub tool_type: String,
    /// The details of the function to be called.
    pub function: FunctionCall,
}

/// The details of a function call.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct FunctionCall {
    /// The name of the function to call.
    pub name: String,
    /// The arguments to call the function with, as a JSON-formatted string.
    pub arguments: String,
}

/// Represents an error object that may be attached to a choice.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ErrorResponse {
    /// The error code.
    pub code: i32,
    /// A human-readable error message.
    pub message: String,
    /// Additional metadata about the error, like provider details.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, serde_json::Value>>,
}
