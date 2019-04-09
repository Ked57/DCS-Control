local base = _G

package.path = package.path .. ";.\\LuaSocket\\?.lua;" .. ".\\Scripts\\?.lua;" .. ".\\Scripts\\UI\\?.lua;"
package.cpath = package.cpath .. ";.\\LuaSocket\\?.dll;"

local require = base.require
local os = base.os
local io = base.io
local table = base.table
local type = base.type

local JSON = loadfile("Scripts\\JSON.lua")()
local socket = require("socket")
local net = require("net")
local DCS = require("DCS")

local dcsc = {
	connection = nil,
	logFile = io.open(lfs.writedir() .. [[Logs\DCS-Control.log]], "w")
}

dcsc.scope = "127.0.0.1"
dcsc.port = 15488
dcsc.DATA_TIMEOUT_SEC = 0.2
dcsc.bound = false

dcsc.JSON = JSON
dcsc.tcp = socket.tcp()
dcsc.tcp:settimeout(0)

module("DCS-Control")

-- functions
dcsc.functions = {}

-- util

function dcsc.log(message)
	if message then
		net.log("[DCS-Control] LOG: " .. message)
	end
end

function dcsc.error(message)
	if message then
		net.log("[DCS-Control] ERROR: " .. message)
	end
end

-- network

function dcsc.bind()
	local bound, error = dcsc.tcp:bind(dcsc.scope, dcsc.port)
	if not bound then
		dcsc.log("Could not bind: " .. error)
		return
	end
	dcsc.log("Port " .. dcsc.port .. " bound")
	local serverStarted, error = dcsc.tcp:listen(1)
	if not serverStarted then
		dcsc.log("Could not start server: " .. error)
		return
	end
	dcsc.bound = true
	dcsc.log("Server started")
end

function dcsc.checkJSON(jsonstring, code)
	if code == "encode" then
		if type(dcsc.JSON:encode(jsonstring)) ~= "string" then
			dcsc.error("encode expects a string after function")
		end
	end
	if code == "decode" then
		if type(jsonstring) ~= "string" then
			dcsc.error("decode expects string")
		end
	end
end

function dcsc.processRequest(request)
	local response = {}
	if request and request.type and request.callbackId then
		response.type = request.type
		response.callbackId = request.callbackId
		if request.data then
			if request.type == "function" and request.data.name then
				response.data = dcsc.functions[request.data.name](request.data.args)
			elseif request.type == "noTimeout" then
				response.data = {}
			end
		end
	end
	return response
end

function dcsc.step()
	if not dcsc.client then
		dcsc.client = dcsc.tcp:accept()
		if dcsc.client then
			dcsc.client:settimeout(0)
			dcsc.log("Connection established")
		end
	end
	if dcsc.client then
		local line, err = dcsc.client:receive("*l")
		local data = {}
		if line ~= nil then
			local success, error = pcall(dcsc.checkJSON, line, "decode")
			if success then
				local incMsg = dcsc.JSON:decode(line)
				dcsc.log(incMsg)
				data = dcsc.processRequest(incMsg)
			else
				dcsc.error(error)
			end
		end
		-- if there was no error, send it back to the dcsc.client
		if not err and data then
			local dataPayload = data --getDataMessage()
			dcsc.send(dataPayload)
		end
	end
end

function dcsc.checkTimeout()
	local dataPayload = {
		type = "noTimeout",
		callbackId = "noTimeout",
		data = {}
	}
	dcsc.send(dataPayload)
end

function dcsc.send(dataPayload)
	if not dcsc.client then
		dcsc.error("Connection lost")
		return
	end
	local success, error = pcall(dcsc.checkJSON, dataPayload, "encode")
	if success then
		local outMsg = dcsc.JSON:encode(dataPayload)
		local bytes, status, lastbyte = dcsc.client:send(outMsg .. "\n")
		if not bytes then
			dcsc.error("Connection lost")
			dcsc.client = nil
		end
	else
		dcsc.error(error)
	end
end

function dcsc.onSimulationFrame()
	if not dcsc.bound then
		dcsc.log("Binding socket")
		dcsc.bind()
	end
	local success, error = pcall(dcsc.step)
	if not success then
		dcsc.error(error)
	end
end

DCS.setUserCallbacks(dcsc)

net.log("DCS-Control server started")
