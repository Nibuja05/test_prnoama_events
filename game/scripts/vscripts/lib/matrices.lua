Matrix = {}
Matrix.__index = Matrix
Matrix_mt = {__call = function(_, ...) return Matrix.new(...) end }
setmetatable(Matrix, Matrix_mt)

--[[ Create a new Matrix. Parameters can be the following:
	- Matrix(2): Creates a 2x2 Matrix with 0s
	- Matrix(2,4): Creates a 2x4 Matrix with 0s
	- Matrix({1,2,3}): Creates a 1x3 Matrix with the table as row
	- Matrix({1,2,3}, {4,5,6}): Creates a 2x3 Matrix with the tables as rows
	- Matrix(2, {1,2}, {3,4,5}): Creates a 2x2 Matrix with tables as rows. Bigger rows shortened, otherwise filled with 0
	- Matrix(2, 4, {...}): Creates a 2x4 Matrix with tables as rows. Bigger rows shortened, otherwise filled with 0
	- Matrix({1,1,1},{2,2,2},{3,3,3},{4,4,4}) - Creates a 4x3 Matrix with tables as rows
	- Matrix("I", 4): Creates a 4x4 Matrix with 0s and diagonal 1s. Default size: 2x2
	- Matrix("R", 40): Creates a 3x3 homogeneous matrix with rotation degree of 40°. Default: 0°
	- Matrix("S", {2,3}): Creates a 3x3 homogeneous matrix with scaling of 2*x, 3*y. Default: {1,1}
	- Matrix("T", {10,2}): Creates a 3x3 homogeneous matrix with translation of x+10, y+2. Default: {0,0}
]]
function Matrix.new(x, y, ...)
	local arg = {...}

	local dimX = 1
	local dimY = 1
	local rows = {}
	local specialType = nil
	local deg = 0
	local scaleX = 1
	local scaleY = 1
	local transX = 0
	local transY = 0

	local dimSet = false

	if type(x) == "number" then
		dimX = x
		dimY = x
		dimSet = true
	elseif type(x) == "string" then
		dimX = 3
		dimY = 3
		if x == "I" then
			specialType = "I"
			dimX = 2
			dimY = 2
		elseif x == "R" then
			specialType = "R"
		elseif x == "S" then
			specialType = "S"
		elseif x == "T" then
			specialType = "T"
		else
			print("[MATRIX] no special matrix with type:", x)
			return nil
		end
	elseif type(x) == "table" then
		table.insert(rows, x)
		dimY = #x
	end
	if type(y) == "number" then
		if specialType == "I" then
			dimX = y
			dimY = y
		elseif specialType == "R" then
			deg = math.rad(y)
		else
			dimY = y
		end
	elseif type(y) == "table" then
		if specialType == "S" then
			if #y == 1 then
				scaleX = y[1]
				scaleY = y[1]
			elseif #y == 2 then
				scaleX = y[1]
				scaleY = y[2]
			else
				print("[MATRIX] too many values for scaling table. Expected 2, got:", #y)
				return nil
			end
		elseif specialType == "T" then
			if #y == 1 then
				transX = y[1]
				transY = y[1]
			elseif #y == 2 then
				transX = y[1]
				transY = y[2]
			else
				print("[MATRIX] too many values for translation table. Expected 2, got:", #y)
				return nil
			end
		else
			table.insert(rows, y)
			if not dimSet then
				dimX = #rows
			end
		end
	end
	if #arg > 0 then
		for k,row in pairs(arg) do
			table.insert(rows, row)
			if not dimSet then
				dimX = dimX + 1
			end
		end
	end
	local data = {}
	if #rows == 0 then
		for i=1, dimX do
			data[i] = {}
			for j=1, dimY do
				data[i][j] = 0
				if specialType and i == j then
					data[i][j] = 1
				end
			end
		end
		if specialType == "R" then
			data[1][1] = math.cos(deg)
			data[1][2] = -math.sin(deg)
			data[2][1] = math.sin(deg)
			data[2][2] = math.cos(deg)
		elseif specialType == "S" then
			data[1][1] = scaleX
			data[2][2] = scaleY
		elseif specialType == "T" then
			data[1][3] = transX
			data[2][3] = transY
		end
	else
		for i=1, dimX do
			data[i] = {}
			for j=1, dimY do
				if i <= #rows then
					if j <= #rows[i] then
						data[i][j] = rows[i][j]
					else
						data[i][j] = 0
					end
				else
					data[i][j] = 0
				end
			end
		end
	end
	return setmetatable({dimX = dimX, dimY = dimY, data = data, sType = specialType}, Matrix)
end

function Matrix:__tostring()
	local rows = ""
	for i,x in pairs(self.data) do
		rows = rows.."{"
		for j,y in pairs(x) do
			rows = rows..tostring(y)
			if j < #x then
				rows = rows..","
			end
		end
		rows = rows.."}"
		if i < #self.data then
			rows = rows..","
		end
	end
	return "Matrix ("..tostring(self.dimX).."x"..tostring(self.dimY)..", {"..rows.."})"
end

function Matrix:__add(m)
	if not (type(m) == "table") then
		if not (type(m) == "number") then
			print("[MATRIX] cannot add ", type(m), " to matrix")
			return nil
		else
			local newData = {}
			for i,x in pairs(self.data) do
				newData[i] = {}
				for j,y in pairs(x) do
					newData[i][j] = y + m
				end
			end
			return setmetatable({dimX = self.dimX, dimY = self.dimY, data = newData, sType = nil},Matrix)
		end
		return nil
	elseif not (self.dimX == m.dimX and self.dimY == m.dimY) then
		print("[MATRIX] cannot add matrices with different dimensions!")
		return nil
	end
	local newData = {}
	for i,x in pairs(self.data) do
		newData[i] = {}
		for j,y in pairs(x) do
			newData[i][j] = y + m.data[i][j]
		end
	end
	return setmetatable({dimX = self.dimX, dimY = self.dimY, data = newData, sType = nil},Matrix)
end

function Matrix:__sub(m)
	if not (type(m) == "table") then
		if not (type(m) == "number") then
			print("[MATRIX] cannot substract ", type(m), " from matrix")
			return nil
		else
			local newData = {}
			for i,x in pairs(self.data) do
				newData[i] = {}
				for j,y in pairs(x) do
					newData[i][j] = y - m
				end
			end
			return setmetatable({dimX = self.dimX, dimY = self.dimY, data = newData, sType = nil},Matrix)
		end
		return nil
	elseif not (self.dimX == m.dimX and self.dimY == m.dimY) then
		print("[MATRIX] cannot substract matrices with different dimensions!")
		return nil
	end
	local newData = {}
	for i,x in pairs(self.data) do
		newData[i] = {}
		for j,y in pairs(x) do
			newData[i][j] = y - m.data[i][j]
		end
	end
	return setmetatable({dimX = self.dimX, dimY = self.dimY, data = newData, sType = nil},Matrix)
end

function Matrix:__mul(m)
	if not (type(m) == "table" or type(m) == "userdata") then
		if not (type(m) == "number") then
			print("[MATRIX] cannot multiply ", type(m), " with matrix")
			return nil
		else
			local newData = {}
			for i,x in pairs(self.data) do
				newData[i] = {}
				for j,y in pairs(x) do
					newData[i][j] = y * m
				end
			end
			return setmetatable({dimX = self.dimX, dimY = self.dimY, data = newData},Matrix)
		end
	end
	if m.dimX and m.dimY and m.data then
		if not (self.dimX == m.dimY and self.dimY == m.dimX) then
			print("[MATRIX] matrix dimensions do not match!")
			return nil
		end
		local newData = {}
		local newDim = self.dimX
		for i=1, newDim do
			newData[i] = {}
			for j=1, newDim do
				local sum = 0
				for x=1, self.dimY do
					sum = sum + self.data[i][x] * m.data[x][j]
				end
				newData[i][j] = sum
			end
		end
		return setmetatable({dimX = newDim, dimY = newDim, data = newData}, Matrix)
	elseif m.x and m.y and m.z then
		if not (self.dimY == 3) then
			print("[MATRIX] matrix dimension does not match vector!")
			return nil
		elseif self.dimX > 3 then
			print("[MATRIX] output vector has max size of 3!")
		end
		local newVec = {}
		local indeces = {"x","y","z"}
		for i=1, self.dimX do
			sum = 0
			for j=1, self.dimY do
				sum = sum + self.data[i][j] * m[indeces[j]]
			end
			newVec[indeces[i]] = sum
		end
		return Vector(newVec.x or 1, newVec.y or 1, newVec.z or 1)
	else
		print("[MATRIX] cannot multiply matrix with unknown table!")
	end
end

function Matrix:Determinant()
	if not (self.dimX == self.dimY) then
		print("[MATRIX] matrix is not quadratic!")
		return nil
	end
	if self.dimX == 1 then
		return self.data[1][1]
	end
	if self.dimX == 2 then
		return self.data[1][1] * self.data[2][2] - self.data[2][1] * self.data[1][2]
	end
	if self.dimX == 3 then
		return ( self.data[1][1]*self.data[2][2]*self.data[3][3] + self.data[1][2]*self.data[2][3]*self.data[3][1] + self.data[1][3]*self.data[2][1]*self.data[3][2]
			- self.data[1][3]*self.data[2][2]*self.data[3][1] - self.data[1][1]*self.data[2][3]*self.data[3][2] - self.data[1][2]*self.data[2][1]*self.data[3][3] )
	end
	print("[MATRIX] matrix determinant of bigger than 3x3 matrices not supported!")
end